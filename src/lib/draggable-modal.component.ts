import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, ComponentRef, ViewContainerRef, Renderer2, ComponentFactoryResolver, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { DraggableModalConfig, DraggableModalRef, ModalButtonOptions } from './draggable-modal.interface';
import { MinimizedModalService } from './minimized-modal.service';

@Component({
  selector: 'app-draggable-modal',
  templateUrl: './draggable-modal.component.html',
  styleUrls: ['./draggable-modal.component.scss']
})
export class DraggableModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modalContainer', { static: true }) modalContainer: ElementRef;
  @ViewChild('modalContent', { static: true }) modalContent: ElementRef;
  @ViewChild('modalHeader', { static: true }) modalHeader: ElementRef;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: false }) dynamicComponentContainer: ViewContainerRef;

  @Input() config: DraggableModalConfig;
  @Input() modalRef: DraggableModalRef;
  @Output() onClose = new EventEmitter<any>();

  // 拖拽相关状态
  isDragging = false;
  isResizing = false;
  isFullscreen = false;

  // 位置和尺寸
  position = { x: 0, y: 0 };
  size = { width: 600, height: 400 };
  originalState = { position: { x: 0, y: 0 }, size: { width: 600, height: 400 } };

  // 拖拽起始位置
  dragStart = { x: 0, y: 0, modalX: 0, modalY: 0 };
  resizeStart = { x: 0, y: 0, width: 0, height: 0, modalX: 0, modalY: 0 };
  resizeDirection = '';

  // 组件实例
  componentRef: ComponentRef<any>;

  // 内容组件实例 (ng-zorro兼容)
  contentComponentRef: ComponentRef<any>;

  // 最小化状态
  isMinimized = false;
  modalId: string;

  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private minimizedModalService: MinimizedModalService
  ) {
    // 生成唯一ID
    this.modalId = 'modal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit() {
    // 重置内容缓存
    this._hasContent = null;

    this.initializeModal();
    this.setupEventListeners();
  }

  ngAfterViewInit() {
    // ViewChild 现在已经可用，可以加载内容
    this.loadContent();
  }

  ngOnDestroy() {
    // 如果模态框被销毁，从最小化列表中移除
    this.minimizedModalService.removeMinimizedModal(this.modalId);

    this.destroy$.next();
    this.destroy$.complete();

    // 清理组件引用
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    if (this.contentComponentRef) {
      this.contentComponentRef.destroy();
    }
  }

  private initializeModal() {
    // 设置初始位置和尺寸
    if (this.config.nzWidth) {
      this.size.width = typeof this.config.nzWidth === 'string'
        ? parseInt(this.config.nzWidth.replace('%', ''))
        : this.config.nzWidth;

      // 如果是百分比，转换为实际像素值
      if (typeof this.config.nzWidth === 'string' && this.config.nzWidth.includes('%')) {
        this.size.width = (window.innerWidth * this.size.width) / 100;
      }
    }

    // 根据内容自动调整高度
    if (this.config.nzBodyStyle?.height) {
      this.size.height = parseInt(this.config.nzBodyStyle.height);
    } else if (!this.hasContent()) {
      // 如果没有内容，使用最小高度
      this.size.height = this.calculateMinimalHeight();
    }

    // 设置初始位置
    if (this.config.initialPosition) {
      this.position = { ...this.config.initialPosition };
    } else if (this.config.nzCentered !== false) {
      // 默认居中显示，除非明确设置为false
      this.centerModal();
    }

    // 设置初始大小
    if (this.config.initialSize) {
      this.size = { ...this.config.initialSize };
    }

    // 设置默认全屏
    if (this.config.defaultFullscreen) {
      this.isFullscreen = true;
      this.updateFullscreenSize();
    }

    // 设置标题显示样式
    this.setTitleDisplayStyle();

    // 设置键盘事件监听
    this.setupKeyboardListeners();

    this.updateModalPosition();
    this.updateModalSize();
  }

  // 计算没有内容时的最小高度
  private calculateMinimalHeight(): number {
    const headerHeight = 54; // 标题栏高度
    const footerHeight = this.config.nzFooter !== null ? 52 : 0; // 底部按钮高度
    const padding = 8; // 额外间距

    return headerHeight + footerHeight + padding;
  }

  private setTitleDisplayStyle() {
    // 检查标题长度，决定显示方式
    if (typeof this.config.nzTitle === 'string') {
      const titleLength = this.config.nzTitle.length;
      // 如果标题较短（少于30个字符），使用单行显示
      if (titleLength <= 30) {
        setTimeout(() => {
          const titleElement = this.modalHeader?.nativeElement?.querySelector('.modal-title');
          if (titleElement) {
            titleElement.classList.add('single-line');
          }
        });
      }
    }
  }

  private centerModal() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    this.position.x = (screenWidth - this.size.width) / 2;
    this.position.y = (screenHeight - this.size.height) / 2;
  }

  private loadContent() {
    console.log('loadContent called, nzContent:', this.config?.nzContent);
    console.log('dynamicComponentContainer:', this.dynamicComponentContainer);

    if (this.config.nzContent) {
      if (typeof this.config.nzContent === 'string') {
        console.log('Loading string content');
        // 如果是字符串，直接设置innerHTML
        this.renderer.setProperty(
          this.dynamicComponentContainer.element.nativeElement,
          'innerHTML',
          this.config.nzContent
        );
      } else if (this.isTemplateRef(this.config.nzContent)) {
        console.log('Loading template content');
        // 如果是TemplateRef
        this.dynamicComponentContainer.createEmbeddedView(this.config.nzContent);
      } else {
        console.log('Loading component content:', this.config.nzContent);
        try {
          // 如果是组件类型
          console.log('Attempting to resolve component factory for:', this.config.nzContent);
          const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.config.nzContent);
          console.log('Component factory created:', componentFactory);

          if (!this.dynamicComponentContainer) {
            console.error('dynamicComponentContainer is null');
            return;
          }

          this.componentRef = this.dynamicComponentContainer.createComponent(componentFactory);
          console.log('Component created:', this.componentRef);

          // 设置 modalRef.componentInstance 为内容组件实例 (ng-zorro兼容)
          if (this.modalRef) {
            this.modalRef.componentInstance = this.componentRef.instance;
            console.log('modalRef.componentInstance set');
          }

          // 保存到 contentComponentRef
          this.contentComponentRef = this.componentRef;

          // 传递参数 - 设置到组件实例
          if (this.config.nzComponentParams) {
            console.log('Setting component params:', this.config.nzComponentParams);
            Object.keys(this.config.nzComponentParams).forEach(key => {
              const value = this.config.nzComponentParams[key];
              this.componentRef.instance[key] = value;
              console.log(`Set ${key} =`, value);
            });
            console.log('Component instance after setting params:', this.componentRef.instance);
          }

          // 触发变更检测以确保组件正确渲染和初始化
          this.componentRef.changeDetectorRef.detectChanges();
          console.log('Change detection triggered - inputs should be available now');

          // 在组件创建和参数设置完成后触发 afterOpen 事件
          // 延迟更久确保组件完全初始化
          setTimeout(() => {
            if (this.modalRef && this.modalRef.afterOpenSubject) {
              this.modalRef.afterOpenSubject.next();
              this.modalRef.afterOpenSubject.complete();
              console.log('afterOpen event triggered');
            }
          }, 100);
        } catch (error) {
          console.error('Error creating component:', error);
        }
      }
    } else {
      console.log('No content to load');
    }

    // 如果不是组件类型（字符串或模板），也需要触发 afterOpen
    if (this.config.nzContent && typeof this.config.nzContent !== 'function') {
      setTimeout(() => {
        if (this.modalRef && this.modalRef.afterOpenSubject) {
          this.modalRef.afterOpenSubject.next();
          this.modalRef.afterOpenSubject.complete();
          console.log('afterOpen event triggered for non-component content');
        }
      }, 100);
    }
  }

  private isTemplateRef(content: any): content is TemplateRef<any> {
    return content && typeof content.createEmbeddedView === 'function';
  }

  private setupEventListeners() {
    // 监听全局鼠标事件
    this.renderer.listen('document', 'mousemove', (event) => this.onMouseMove(event));
    this.renderer.listen('document', 'mouseup', () => this.onMouseUp());

    // 监听窗口大小变化
    this.renderer.listen('window', 'resize', () => this.onWindowResize());

    // 监听遮罩点击事件
    if (this.isMaskClosable()) {
      this.renderer.listen(this.modalContainer.nativeElement.parentElement, 'click', (event) => {
        if (event.target === event.currentTarget) {
          this.close();
        }
      });
    }
  }

  private setupKeyboardListeners() {
    // 监听ESC键关闭
    if (this.config.nzKeyboard !== false) {
      this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.close();
        }
      });
    }
  }

  // 检查是否可拖拽
  isDraggable(): boolean {
    return this.config?.draggable !== false; // 默认为true
  }

  // 检查是否可调整大小
  isResizable(): boolean {
    return this.config?.resizable !== false; // 默认为true
  }

  // 检查是否显示全屏按钮
  showFullscreenButton(): boolean {
    return this.config?.showFullscreenButton !== false; // 默认为true
  }

  // 检查是否显示关闭按钮
  isClosable(): boolean {
    return this.config?.nzClosable !== false; // 默认为true
  }

  // 检查是否显示遮罩
  showMask(): boolean {
    return this.config?.nzMask !== false; // 默认为true
  }

  // 检查点击遮罩是否可关闭
  isMaskClosable(): boolean {
    return this.config?.nzMaskClosable !== false; // 默认为true
  }

  // 检查是否显示最小化按钮
  showMinimizeButton(): boolean {
    return this.config?.showMinimizeButton === true; // 默认为false
  }

  // 获取遮罩样式
  getMaskStyle(): { [key: string]: string } {
    return this.config?.nzMaskStyle || {};
  }

  // 获取外层容器样式
  getWrapClassName(): string {
    return this.config?.nzWrapClassName || '';
  }

  // 获取z-index
  getZIndex(): number {
    return this.config?.nzZIndex || 1000;
  }

  // 获取方向
  getDirection(): string {
    return this.config?.nzDirection || 'ltr';
  }

  // 检查是否是按钮数组
  isModalButtonArray(footer: any): footer is ModalButtonOptions[] {
    return Array.isArray(footer) && footer.length > 0 && typeof footer[0] === 'object' && 'label' in footer[0];
  }

  // 获取按钮样式类
  getButtonClass(button: ModalButtonOptions): string {
    let baseClass = 'btn';

    // 根据type设置样式
    switch (button.type || 'default') {
      case 'primary':
        baseClass += ' btn-primary';
        break;
      case 'danger':
        baseClass += button.danger ? ' btn-danger' : ' btn-default';
        break;
      case 'dashed':
        baseClass += ' btn-dashed';
        break;
      case 'link':
        baseClass += ' btn-link';
        break;
      case 'text':
        baseClass += ' btn-text';
        break;
      default:
        baseClass += ' btn-default';
    }

    // 添加其他样式
    if (button.ghost) baseClass += ' btn-ghost';
    if (button.shape === 'circle') baseClass += ' btn-circle';
    if (button.shape === 'round') baseClass += ' btn-round';
    if (button.size) baseClass += ` btn-${button.size}`;

    return baseClass;
  }

  // 获取确定按钮样式类
  getOkButtonClass(): string {
    let baseClass = 'btn';

    switch (this.config?.nzOkType || 'primary') {
      case 'primary':
        baseClass += ' btn-primary';
        break;
      case 'danger':
        baseClass += this.config?.nzOkDanger ? ' btn-danger' : ' btn-default';
        break;
      case 'dashed':
        baseClass += ' btn-dashed';
        break;
      case 'link':
        baseClass += ' btn-link';
        break;
      case 'text':
        baseClass += ' btn-text';
        break;
      default:
        baseClass += ' btn-default';
    }

    return baseClass;
  }

  // 获取按钮禁用状态
  getButtonDisabled(button: ModalButtonOptions): boolean {
    if (typeof button.disabled === 'function') {
      return button.disabled.call(button, this.modalRef?.componentInstance);
    }
    return button.disabled || false;
  }

  // 获取按钮显示状态
  getButtonShow(button: ModalButtonOptions): boolean {
    if (typeof button.show === 'function') {
      return button.show.call(button, this.modalRef?.componentInstance);
    }
    return button.show !== false; // 默认显示
  }

  // 获取按钮加载状态
  getButtonLoading(button: ModalButtonOptions): boolean {
    if (typeof button.loading === 'function') {
      return button.loading.call(button, this.modalRef?.componentInstance);
    }
    return button.loading || false;
  }

  // 自定义按钮点击事件
  async onCustomButtonClick(button: ModalButtonOptions): Promise<void> {
    if (this.getButtonDisabled(button) || this.getButtonLoading(button)) {
      return;
    }

    if (button.onClick) {
      try {
        // 如果设置了autoLoading，自动显示加载状态
        if (button.autoLoading) {
          button.loading = true;
        }

        const result = await button.onClick.call(button, this.modalRef?.componentInstance);

        // 如果onClick返回false，不关闭对话框
        if (result !== false) {
          this.close(result);
        }
      } catch (error) {
        console.error('Button click handler error:', error);
      } finally {
        if (button.autoLoading) {
          button.loading = false;
        }
      }
    }
  }

  // 用于trackBy的方法
  trackByButtonLabel(index: number, button: ModalButtonOptions): string {
    return button.label + index;
  }

  // 开始拖拽
  onDragStart(event: MouseEvent) {
    if (this.isFullscreen || !this.isDraggable()) return;

    this.isDragging = true;
    this.dragStart.x = event.clientX;
    this.dragStart.y = event.clientY;
    this.dragStart.modalX = this.position.x;
    this.dragStart.modalY = this.position.y;

    event.preventDefault();
  }

  // 开始调整大小
  onResizeStart(event: MouseEvent, direction: string) {
    if (this.isFullscreen || !this.isResizable()) return;

    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStart.x = event.clientX;
    this.resizeStart.y = event.clientY;
    this.resizeStart.width = this.size.width;
    this.resizeStart.height = this.size.height;
    this.resizeStart.modalX = this.position.x;
    this.resizeStart.modalY = this.position.y;

    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = event.clientX - this.dragStart.x;
      const deltaY = event.clientY - this.dragStart.y;

      this.position.x = this.dragStart.modalX + deltaX;
      this.position.y = this.dragStart.modalY + deltaY;

      // 边界检查
      this.constrainPosition();
      this.updateModalPosition();
    }

    if (this.isResizing) {
      const deltaX = event.clientX - this.resizeStart.x;
      const deltaY = event.clientY - this.resizeStart.y;

      switch (this.resizeDirection) {
        case 'right':
          this.size.width = Math.max(300, this.resizeStart.width + deltaX);
          break;
        case 'bottom':
          this.size.height = Math.max(200, this.resizeStart.height + deltaY);
          break;
        case 'corner':
          this.size.width = Math.max(300, this.resizeStart.width + deltaX);
          this.size.height = Math.max(200, this.resizeStart.height + deltaY);
          break;
        case 'left':
          const newWidth = Math.max(300, this.resizeStart.width - deltaX);
          if (newWidth !== this.size.width) {
            this.position.x = this.resizeStart.modalX + (this.resizeStart.width - newWidth);
            this.size.width = newWidth;
          }
          break;
        case 'top':
          const newHeight = Math.max(200, this.resizeStart.height - deltaY);
          if (newHeight !== this.size.height) {
            this.position.y = this.resizeStart.modalY + (this.resizeStart.height - newHeight);
            this.size.height = newHeight;
          }
          break;
      }

      this.updateModalPosition();
      this.updateModalSize();
    }
  }

  private onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  private constrainPosition() {
    const maxX = window.innerWidth - this.size.width;
    const maxY = window.innerHeight - this.size.height;

    this.position.x = Math.max(0, Math.min(maxX, this.position.x));
    this.position.y = Math.max(0, Math.min(maxY, this.position.y));
  }

  private updateModalPosition() {
    const element = this.modalContainer.nativeElement;
    this.renderer.setStyle(element, 'left', `${this.position.x}px`);
    this.renderer.setStyle(element, 'top', `${this.position.y}px`);
  }

  private updateModalSize() {
    const element = this.modalContainer.nativeElement;
    this.renderer.setStyle(element, 'width', `${this.size.width}px`);

    // 全屏时始终填充整个屏幕
    if (this.isFullscreen) {
      this.renderer.setStyle(element, 'height', `${this.size.height}px`);
      this.renderer.removeStyle(element, 'min-height');
    } else {
      // 非全屏时根据内容调整高度
      if (!this.hasContent()) {
        this.renderer.setStyle(element, 'height', 'auto');
        this.renderer.setStyle(element, 'min-height', `${this.calculateMinimalHeight()}px`);
      } else {
        this.renderer.setStyle(element, 'height', `${this.size.height}px`);
        this.renderer.removeStyle(element, 'min-height');
      }
    }
  }

  private onWindowResize() {
    if (this.isFullscreen) {
      this.updateFullscreenSize();
    } else {
      this.constrainPosition();
      this.updateModalPosition();
    }
  }

  // 全屏切换
  toggleFullscreen() {
    if (!this.showFullscreenButton()) return;

    if (!this.isFullscreen) {
      // 保存当前状态
      this.originalState.position = { ...this.position };
      this.originalState.size = { ...this.size };

      // 设置全屏
      this.isFullscreen = true;
      this.position = { x: 0, y: 0 };
      this.updateFullscreenSize();
    } else {
      // 恢复原始状态
      this.isFullscreen = false;
      this.position = { ...this.originalState.position };
      this.size = { ...this.originalState.size };
      this.updateModalPosition();
      this.updateModalSize();
    }
  }

  private updateFullscreenSize() {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.updateModalPosition();
    this.updateModalSize();
  }

  // 最小化
  minimize() {
    console.log('DraggableModalComponent: minimize() called for modal:', this.modalId);
    this.isMinimized = true;

    // 隐藏整个模态框（包括遮罩）
    const maskElement = this.modalContainer.nativeElement.parentElement;
    if (maskElement) {
      this.renderer.addClass(maskElement, 'minimized');
      this.renderer.setStyle(maskElement, 'display', 'none');
      console.log('DraggableModalComponent: Hidden mask element');
    }

    // 添加到最小化列表
    const title = typeof this.config.nzTitle === 'string' ? this.config.nzTitle : '未命名窗口';
    const minimizedModal = {
      id: this.modalId,
      title: title,
      modalRef: this,
      minimizedAt: new Date()
    };
    console.log('DraggableModalComponent: Adding to minimized service:', minimizedModal);
    this.minimizedModalService.addMinimizedModal(minimizedModal);
  }

  // 还原
  restore() {
    this.isMinimized = false;

    // 显示整个模态框（包括遮罩）
    const maskElement = this.modalContainer.nativeElement.parentElement;
    if (maskElement) {
      this.renderer.removeClass(maskElement, 'minimized');
      this.renderer.setStyle(maskElement, 'display', 'flex');
    }

    // 确保模态框容器也是可见的
    this.renderer.setStyle(this.modalContainer.nativeElement, 'display', 'flex');

    // 从最小化列表中移除
    this.minimizedModalService.removeMinimizedModal(this.modalId);

    // 重新居中（可选）
    this.centerModal();
    this.updateModalPosition();
  }

  // 关闭modal
  close(result?: any) {
    this.onClose.emit(result);
    if (this.modalRef) {
      this.modalRef.close(result);
    }
  }

  // 确认操作
  confirm() {
    if (this.config.nzOnOk) {
      const result = this.config.nzOnOk();
      if (result !== false) {
        this.close(result);
      }
    } else {
      this.close(true);
    }
  }

  // 取消操作
  cancel() {
    if (this.config.nzOnCancel) {
      const result = this.config.nzOnCancel();
      if (result !== false) {
        this.close(result);
      }
    } else {
      this.close(false);
    }
  }

  // 获取标题tooltip
  getTitleTooltip(): string {
    // 如果标题是字符串且较长，显示完整标题作为tooltip
    if (typeof this.config?.nzTitle === 'string') {
      const titleLength = this.config.nzTitle.length;
      return titleLength > 30 ? this.config.nzTitle : '';
    }
    return '';
  }

  // 缓存hasContent的结果，避免无限循环
  private _hasContent: boolean | null = null;

  // 检查是否有内容需要显示
  hasContent(): boolean {
    // 如果已经计算过，直接返回缓存结果
    if (this._hasContent !== null) {
      return this._hasContent;
    }

    const content = this.config?.nzContent;
    console.log('hasContent called ONCE, content:', content, 'type:', typeof content);

    // 检查各种空内容的情况
    if (!content) {
      console.log('hasContent: false - no content');
      this._hasContent = false;
      return false;
    }

    // 如果是字符串，检查是否为空或只有空白字符
    if (typeof content === 'string') {
      const hasStringContent = content.trim().length > 0;
      console.log('hasContent: string content:', hasStringContent);
      this._hasContent = hasStringContent;
      return hasStringContent;
    }

    // 如果是模板或组件，认为有内容
    console.log('hasContent: true - template or component');
    this._hasContent = true;
    return true;
  }
}