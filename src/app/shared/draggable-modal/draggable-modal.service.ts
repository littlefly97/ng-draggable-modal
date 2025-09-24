import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, EmbeddedViewRef, ComponentRef, TemplateRef, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DraggableModalComponent } from './draggable-modal.component';
import { DraggableModalConfig, DraggableModalRef, ConfirmModalConfig, ModalType } from './draggable-modal.interface';

@Injectable({
  providedIn: 'root'
})
export class DraggableModalService {
  private openModals: DraggableModalRef[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  /**
   * 创建模态框 - 兼容ng-zorro的create方法
   */
  create(config: DraggableModalConfig): DraggableModalRef {
    const modalRef = this.createModal(config, ModalType.DEFAULT);
    return modalRef;
  }

  /**
   * 确认对话框 - 兼容ng-zorro的confirm方法
   */
  confirm(config: ConfirmModalConfig): DraggableModalRef {
    // 动态计算宽度，确保标题能完整显示
    const calculatedWidth = this.calculateOptimalWidth(config);

    const confirmConfig: DraggableModalConfig = {
      ...config,
      nzIconType: config.nzIconType || 'question-circle',
      nzOkText: config.nzOkText || '确定',
      nzCancelText: config.nzCancelText || '取消',
      nzWidth: config.nzWidth || calculatedWidth
    };

    // 创建确认对话框的内容
    if (typeof config.nzContent === 'string') {
      confirmConfig.nzContent = this.createConfirmContent(config.nzContent, confirmConfig.nzIconType);
    }

    const modalRef = this.createModal(confirmConfig, ModalType.CONFIRM);
    return modalRef;
  }

  /**
   * 信息对话框 - 兼容ng-zorro的info方法
   */
  info(config: ConfirmModalConfig): DraggableModalRef {
    return this.confirm({
      ...config,
      nzIconType: 'info-circle',
      nzCancelText: null // info对话框通常只有确定按钮
    });
  }

  /**
   * 成功对话框 - 兼容ng-zorro的success方法
   */
  success(config: ConfirmModalConfig): DraggableModalRef {
    return this.confirm({
      ...config,
      nzIconType: 'check-circle',
      nzCancelText: null
    });
  }

  /**
   * 警告对话框 - 兼容ng-zorro的warning方法
   */
  warning(config: ConfirmModalConfig): DraggableModalRef {
    return this.confirm({
      ...config,
      nzIconType: 'exclamation-circle'
    });
  }

  /**
   * 错误对话框 - 兼容ng-zorro的error方法
   */
  error(config: ConfirmModalConfig): DraggableModalRef {
    return this.confirm({
      ...config,
      nzIconType: 'close-circle'
    });
  }

  /**
   * 关闭所有模态框
   */
  closeAll(): void {
    this.openModals.forEach(modal => modal.destroy());
    this.openModals = [];
  }

  /**
   * 获取当前打开的模态框数量
   */
  get openModalsCount(): number {
    return this.openModals.length;
  }

  private createModal(config: DraggableModalConfig, type: ModalType): DraggableModalRef {
    // 创建模态框引用
    const modalRef = this.createModalRef();

    // 设置默认配置
    const finalConfig = this.mergeDefaultConfig(config);

    // 创建组件
    const componentRef = this.createModalComponent(finalConfig, modalRef);

    // 添加到页面
    this.appendToBody(componentRef);

    // 添加到管理列表
    this.openModals.push(modalRef);

    // 监听关闭事件
    modalRef.afterClose.subscribe(() => {
      this.removeModal(modalRef, componentRef);
    });

    return modalRef;
  }

  private createModalRef(): DraggableModalRef {
    const afterCloseSubject = new Subject<any>();

    const modalRef: DraggableModalRef = {
      close: (result?: any) => {
        afterCloseSubject.next(result);
        afterCloseSubject.complete();
      },
      destroy: () => {
        afterCloseSubject.next(null);
        afterCloseSubject.complete();
      },
      getContentComponent: () => null, // 将在组件创建后设置
      afterClose: afterCloseSubject.asObservable(),
      afterCloseSubject
    };

    return modalRef;
  }

  private mergeDefaultConfig(config: DraggableModalConfig): DraggableModalConfig {
    return {
      draggable: true,
      resizable: true,
      showFullscreenButton: true,
      showMinimizeButton: true,
      nzMaskClosable: true,
      defaultFullscreen: false,
      zIndex: 1000,
      nzWidth: config.nzWidth || this.calculateOptimalWidth(config),
      ...config
    };
  }

  /**
   * 根据标题和内容长度计算最优宽度
   */
  private calculateOptimalWidth(config: DraggableModalConfig | ConfirmModalConfig): number {
    let titleWidth = 0;
    let contentWidth = 0;

    // 计算标题宽度
    if (typeof config.nzTitle === 'string') {
      titleWidth = this.calculateTextWidth(config.nzTitle, 16); // 16px font size for title
    }

    // 计算内容宽度（如果是字符串）
    if (typeof config.nzContent === 'string') {
      contentWidth = this.calculateTextWidth(config.nzContent, 14); // 14px font size for content
    }

    // 为标题计算所需宽度：文本宽度 + 控制按钮 + 内边距
    const titleRequiredWidth = titleWidth + 120 + 32; // 120px for controls, 32px for padding

    // 为内容计算所需宽度：内容宽度 + 图标 + 内边距
    const contentRequiredWidth = Math.min(contentWidth + 80 + 32, 800); // 80px for icon, max 800px

    // 取较大值作为最终宽度
    const calculatedWidth = Math.max(titleRequiredWidth, contentRequiredWidth);

    // 设置合理的最小和最大限制
    const minWidth = 416;
    const maxWidth = Math.min(window.innerWidth * 0.85, 1200);

    return Math.max(minWidth, Math.min(calculatedWidth, maxWidth));
  }

  /**
   * 计算文本实际显示宽度，考虑中英文字符差异
   */
  private calculateTextWidth(text: string, fontSize: number): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      // 降级方案：基于字符数估算
      const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const otherCharCount = text.length - chineseCharCount;
      return chineseCharCount * fontSize + otherCharCount * (fontSize * 0.6);
    }

    context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    const metrics = context.measureText(text);

    return Math.ceil(metrics.width);
  }

  private createModalComponent(config: DraggableModalConfig, modalRef: DraggableModalRef): ComponentRef<DraggableModalComponent> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DraggableModalComponent);
    const componentRef = componentFactory.create(this.injector);

    // 设置输入属性
    componentRef.instance.config = config;
    componentRef.instance.modalRef = modalRef;

    // 监听关闭事件
    componentRef.instance.onClose.subscribe((result) => {
      modalRef.close(result);
    });

    return componentRef;
  }

  private appendToBody(componentRef: ComponentRef<DraggableModalComponent>): void {
    // 添加到Angular应用
    this.appRef.attachView(componentRef.hostView);

    // 添加到DOM
    const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);
  }

  private removeModal(modalRef: DraggableModalRef, componentRef: ComponentRef<DraggableModalComponent>): void {
    // 从管理列表中移除
    const index = this.openModals.indexOf(modalRef);
    if (index > -1) {
      this.openModals.splice(index, 1);
    }

    // 从DOM中移除
    this.appRef.detachView(componentRef.hostView);
    const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    if (domElement && domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }

    // 销毁组件
    componentRef.destroy();
  }

  private createConfirmContent(content: string, iconType: string): string {
    const iconMap = {
      'question-circle': '?',
      'info-circle': 'ℹ',
      'check-circle': '✓',
      'exclamation-circle': '⚠',
      'close-circle': '✕'
    };

    const colorMap = {
      'question-circle': '#faad14',
      'info-circle': '#1890ff',
      'check-circle': '#52c41a',
      'exclamation-circle': '#faad14',
      'close-circle': '#ff4d4f'
    };

    const icon = iconMap[iconType] || '?';
    const color = colorMap[iconType] || '#faad14';
    const cssClass = iconType.replace('-circle', '');

    return `
      <div class="confirm-modal">
        <div style="display: flex; align-items: flex-start; gap: 12px; min-height: 60px;">
          <div class="confirm-icon ${cssClass}" style="font-size: 22px; margin-top: 2px; color: ${color}; width: 22px; text-align: center;">${icon}</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; color: rgba(0, 0, 0, 0.85); line-height: 1.5; word-wrap: break-word;">${content}</div>
          </div>
        </div>
      </div>
    `;
  }
}