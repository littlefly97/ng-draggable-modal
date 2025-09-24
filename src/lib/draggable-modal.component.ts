import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, ComponentRef, ViewContainerRef, Renderer2, ComponentFactoryResolver } from '@angular/core';
import { Subject } from 'rxjs';
import { DraggableModalConfig, DraggableModalRef } from './draggable-modal.interface';
import { MinimizedModalService } from './minimized-modal.service';

@Component({
  selector: 'app-draggable-modal',
  templateUrl: './draggable-modal.component.html',
  styleUrls: ['./draggable-modal.component.scss']
})
export class DraggableModalComponent implements OnInit, OnDestroy {
  @ViewChild('modalContainer', { static: true }) modalContainer: ElementRef;
  @ViewChild('modalContent', { static: true }) modalContent: ElementRef;
  @ViewChild('modalHeader', { static: true }) modalHeader: ElementRef;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer: ViewContainerRef;

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
    this.initializeModal();
    this.setupEventListeners();
    this.loadContent();
  }

  ngOnDestroy() {
    // 如果模态框被销毁，从最小化列表中移除
    this.minimizedModalService.removeMinimizedModal(this.modalId);

    this.destroy$.next();
    this.destroy$.complete();
    if (this.componentRef) {
      this.componentRef.destroy();
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

    // 设置标题显示样式
    this.setTitleDisplayStyle();

    // 居中显示
    this.centerModal();
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
    if (this.config.nzContent) {
      if (typeof this.config.nzContent === 'string') {
        // 如果是字符串，直接设置innerHTML
        this.renderer.setProperty(
          this.dynamicComponentContainer.element.nativeElement,
          'innerHTML',
          this.config.nzContent
        );
      } else if (this.isTemplateRef(this.config.nzContent)) {
        // 如果是TemplateRef
        this.dynamicComponentContainer.createEmbeddedView(this.config.nzContent);
      } else {
        // 如果是组件类型
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.config.nzContent);
        this.componentRef = this.dynamicComponentContainer.createComponent(componentFactory);

        // 传递参数
        if (this.config.nzComponentParams) {
          Object.keys(this.config.nzComponentParams).forEach(key => {
            if (this.componentRef.instance.hasOwnProperty(key)) {
              this.componentRef.instance[key] = this.config.nzComponentParams[key];
            }
          });
        }
      }
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
    this.isMinimized = true;
    this.renderer.setStyle(this.modalContainer.nativeElement, 'display', 'none');

    // 添加到最小化列表
    const title = typeof this.config.nzTitle === 'string' ? this.config.nzTitle : '未命名窗口';
    this.minimizedModalService.addMinimizedModal({
      id: this.modalId,
      title: title,
      modalRef: this,
      minimizedAt: new Date()
    });
  }

  // 还原
  restore() {
    this.isMinimized = false;
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

  // 检查是否有内容需要显示
  hasContent(): boolean {
    const content = this.config?.nzContent;

    // 检查各种空内容的情况
    if (!content) return false;

    // 如果是字符串，检查是否为空或只有空白字符
    if (typeof content === 'string') {
      return content.trim().length > 0;
    }

    // 如果是模板或组件，认为有内容
    return true;
  }
}