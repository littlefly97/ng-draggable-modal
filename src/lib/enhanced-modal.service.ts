import { Injectable } from '@angular/core';
import { DraggableModalService } from './draggable-modal.service';
import { DraggableModalConfig, DraggableModalRef, ConfirmModalConfig } from './draggable-modal.interface';

/**
 * 增强版Modal服务 - 完全兼容ng-zorro-antd的NzModalService API
 * 可以直接替换NzModalService使用，提供拖拽、全屏等增强功能
 */
@Injectable({
  providedIn: 'root'
})
export class EnhancedModalService {

  constructor(private draggableModalService: DraggableModalService) {}

  /**
   * 创建模态框
   * 完全兼容 NzModalService.create() 的API
   */
  create<T>(config: DraggableModalConfig): DraggableModalRef {
    return this.draggableModalService.create(config);
  }

  /**
   * 确认对话框
   * 完全兼容 NzModalService.confirm() 的API
   */
  confirm(config: ConfirmModalConfig): DraggableModalRef {
    return this.draggableModalService.confirm(config);
  }

  /**
   * 信息对话框
   * 完全兼容 NzModalService.info() 的API
   */
  info(config: ConfirmModalConfig): DraggableModalRef {
    return this.draggableModalService.info(config);
  }

  /**
   * 成功对话框
   * 完全兼容 NzModalService.success() 的API
   */
  success(config: ConfirmModalConfig): DraggableModalRef {
    return this.draggableModalService.success(config);
  }

  /**
   * 警告对话框
   * 完全兼容 NzModalService.warning() 的API
   */
  warning(config: ConfirmModalConfig): DraggableModalRef {
    return this.draggableModalService.warning(config);
  }

  /**
   * 错误对话框
   * 完全兼容 NzModalService.error() 的API
   */
  error(config: ConfirmModalConfig): DraggableModalRef {
    return this.draggableModalService.error(config);
  }

  /**
   * 关闭所有模态框
   * 完全兼容 NzModalService.closeAll() 的API
   */
  closeAll(): void {
    this.draggableModalService.closeAll();
  }

  /**
   * 获取当前打开的模态框数量
   */
  get openModalsCount(): number {
    return this.draggableModalService.openModalsCount;
  }
}