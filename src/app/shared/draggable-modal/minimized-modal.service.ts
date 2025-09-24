import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MinimizedModal {
  id: string;
  title: string;
  modalRef: any;
  minimizedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MinimizedModalService {
  private minimizedModals: MinimizedModal[] = [];
  private minimizedModals$ = new BehaviorSubject<MinimizedModal[]>([]);

  // 获取最小化的模态框列表
  getMinimizedModals() {
    return this.minimizedModals$.asObservable();
  }

  // 添加最小化的模态框
  addMinimizedModal(modal: MinimizedModal) {
    this.minimizedModals.push(modal);
    this.minimizedModals$.next([...this.minimizedModals]);
  }

  // 还原模态框
  restoreModal(id: string) {
    const index = this.minimizedModals.findIndex(modal => modal.id === id);
    if (index > -1) {
      const modal = this.minimizedModals[index];
      this.minimizedModals.splice(index, 1);
      this.minimizedModals$.next([...this.minimizedModals]);
      return modal;
    }
    return null;
  }

  // 移除最小化的模态框（当模态框被关闭时）
  removeMinimizedModal(id: string) {
    const index = this.minimizedModals.findIndex(modal => modal.id === id);
    if (index > -1) {
      this.minimizedModals.splice(index, 1);
      this.minimizedModals$.next([...this.minimizedModals]);
    }
  }

  // 获取当前最小化的模态框数量
  getMinimizedCount(): number {
    return this.minimizedModals.length;
  }
}