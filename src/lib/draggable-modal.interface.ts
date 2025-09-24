import { TemplateRef, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface DraggableModalConfig {
  // 标题
  nzTitle?: string | TemplateRef<any>;

  // 内容
  nzContent?: string | TemplateRef<any> | Type<any>;

  // 组件参数
  nzComponentParams?: any;

  // 宽度
  nzWidth?: number | string;

  // 样式
  nzBodyStyle?: { [key: string]: string };
  nzStyle?: { [key: string]: string };

  // 按钮文本
  nzOkText?: string | null;
  nzCancelText?: string | null;

  // 回调函数
  nzOnOk?: () => any | Promise<any>;
  nzOnCancel?: () => any | Promise<any>;

  // 底部
  nzFooter?: TemplateRef<any> | null;

  // 图标类型（用于确认对话框）
  nzIconType?: 'question-circle' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'close-circle';

  // 是否可拖拽（默认true）
  draggable?: boolean;

  // 是否可调整大小（默认true）
  resizable?: boolean;

  // 是否显示全屏按钮（默认true）
  showFullscreenButton?: boolean;

  // 是否显示最小化按钮
  showMinimizeButton?: boolean;

  // 是否可以点击遮罩关闭
  nzMaskClosable?: boolean;

  // 默认是否全屏
  defaultFullscreen?: boolean;

  // 初始位置
  initialPosition?: { x: number; y: number };

  // 初始大小
  initialSize?: { width: number; height: number };

  // z-index
  zIndex?: number;
}

export interface DraggableModalRef {
  // 关闭Modal
  close(result?: any): void;

  // 销毁Modal
  destroy(): void;

  // 获取组件实例
  getContentComponent(): any;

  // 组件实例 (ng-zorro兼容)
  componentInstance?: any;

  // 结果Observable
  afterClose: Observable<any>;

  // 打开后Observable (ng-zorro兼容)
  afterOpen: Observable<void>;

  // 内部subject
  afterCloseSubject: Subject<any>;

  // 内部subject (ng-zorro兼容)
  afterOpenSubject: Subject<void>;
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