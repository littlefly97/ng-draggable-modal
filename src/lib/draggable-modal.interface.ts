import { TemplateRef, Type, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// 按钮选项接口（ng-zorro 兼容）
export interface ModalButtonOptions {
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'danger' | 'link' | 'text';
  danger?: boolean;
  shape?: 'circle' | 'round';
  ghost?: boolean;
  size?: 'large' | 'default' | 'small';
  autoLoading?: boolean;
  show?: boolean | ((this: ModalButtonOptions, contentComponentInstance?: object) => boolean);
  loading?: boolean | ((this: ModalButtonOptions, contentComponentInstance?: object) => boolean);
  disabled?: boolean | ((this: ModalButtonOptions, contentComponentInstance?: object) => boolean);
  onClick?(this: ModalButtonOptions, contentComponentInstance?: object): void | Promise<void> | any;
}

export interface DraggableModalConfig {
  // === 基础属性 ===
  // 标题
  nzTitle?: string | TemplateRef<any>;

  // 内容
  nzContent?: string | TemplateRef<any> | Type<any>;

  // 组件参数
  nzComponentParams?: any;

  // === 尺寸和位置 ===
  // 宽度
  nzWidth?: number | string;

  // 是否垂直居中
  nzCentered?: boolean;

  // === 样式 ===
  // Modal body 样式
  nzBodyStyle?: { [key: string]: string };

  // 设置浮层样式，调整浮层位置等
  nzStyle?: { [key: string]: string };

  // 遮罩样式
  nzMaskStyle?: { [key: string]: string };

  // 对话框类名
  nzClassName?: string;

  // 对话框外层容器类名
  nzWrapClassName?: string;

  // === 按钮配置 ===
  // 确认按钮文字
  nzOkText?: string | null;

  // 取消按钮文字
  nzCancelText?: string | null;

  // 确认按钮类型
  nzOkType?: 'primary' | 'default' | 'dashed' | 'danger' | 'link' | 'text';

  // 确认按钮是否为危险按钮
  nzOkDanger?: boolean;

  // 确定按钮 loading
  nzOkLoading?: boolean;

  // 取消按钮 loading
  nzCancelLoading?: boolean;

  // 是否禁用确定按钮
  nzOkDisabled?: boolean;

  // 是否禁用取消按钮
  nzCancelDisabled?: boolean;

  // === 回调函数 ===
  // 点击确定回调
  nzOnOk?: (instance?: any) => any | Promise<any>;

  // 点击取消回调
  nzOnCancel?: (instance?: any) => any | Promise<any>;

  // Modal 打开后的回调
  nzAfterOpen?: () => void;

  // Modal 完全关闭后的回调
  nzAfterClose?: (result?: any) => void;

  // === 底部配置 ===
  // 底部内容
  nzFooter?: string | TemplateRef<any> | ModalButtonOptions[] | null;

  // === 交互配置 ===
  // 是否显示右上角关闭按钮
  nzClosable?: boolean;

  // 自定义关闭图标
  nzCloseIcon?: string | TemplateRef<void>;

  // 是否展示遮罩
  nzMask?: boolean;

  // 点击遮罩是否允许关闭
  nzMaskClosable?: boolean;

  // 是否支持键盘 esc 关闭
  nzKeyboard?: boolean;

  // 模态框是否可拖动
  nzDraggable?: boolean;

  // 历史前进/后退时是否关闭
  nzCloseOnNavigation?: boolean;

  // === 其他配置 ===
  // 对话框是否可见
  nzVisible?: boolean;

  // z-index
  nzZIndex?: number;

  // 文字方向
  nzDirection?: 'ltr' | 'rtl';

  // 自动聚焦
  nzAutofocus?: 'ok' | 'cancel' | 'auto' | null;

  // 图标类型（确认框模式）
  nzIconType?: 'question-circle' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'close-circle';

  // === 扩展功能（原有功能） ===
  // 是否可拖拽（默认true，与 nzDraggable 同义）
  draggable?: boolean;

  // 是否可调整大小（默认true）
  resizable?: boolean;

  // 是否显示全屏按钮（默认true）
  showFullscreenButton?: boolean;

  // 是否显示最小化按钮
  showMinimizeButton?: boolean;

  // 默认是否全屏
  defaultFullscreen?: boolean;

  // 初始位置
  initialPosition?: { x: number; y: number };

  // 初始大小
  initialSize?: { width: number; height: number };
}

export interface DraggableModalRef {
  // === 基础方法 ===
  // 关闭Modal
  close(result?: any): void;

  // 销毁Modal
  destroy(result?: any): void;

  // === ng-zorro 兼容方法 ===
  // 获取对话框内容中nzContent的 Component 实例
  getContentComponent(): any;

  // 获取对话框内容中nzContent的 Component 引用
  getContentComponentRef(): any;

  // 手动触发 nzOnOk
  triggerOk(): void;

  // 手动触发 nzOnCancel
  triggerCancel(): void;

  // 更新配置
  updateConfig(config: Partial<DraggableModalConfig>): void;

  // === 属性 ===
  // 组件实例 (ng-zorro兼容)
  componentInstance?: any;

  // === 事件 Observable ===
  // 打开后Observable (ng-zorro兼容)
  afterOpen: Observable<void>;

  // 结果Observable
  afterClose: Observable<any>;

  // === 内部 Subject (仅内部使用) ===
  // 内部subject (ng-zorro兼容)
  afterOpenSubject: Subject<void>;

  // 内部subject
  afterCloseSubject: Subject<any>;

  // === 内部属性和方法 (仅库内部使用) ===
  _setConfig?: (config: DraggableModalConfig) => void;
  _setComponentRef?: (ref: any) => void;
  _modalComponent?: any;
  _componentRef?: any;
}

export interface ConfirmModalConfig extends Omit<DraggableModalConfig, 'nzContent'> {
  // 确认对话框特有配置
  nzContent?: string;
  nzIconType?: 'question-circle' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'close-circle';
}

export enum ModalType {
  DEFAULT = 'default',
  CONFIRM = 'confirm',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}