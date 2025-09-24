import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MinimizedModalService, MinimizedModal } from './minimized-modal.service';

@Component({
  selector: 'ng-modal-taskbar',
  template: `
    <div class="modal-taskbar" *ngIf="minimizedModals.length > 0">
      <div class="taskbar-title">最小化窗口</div>
      <div class="taskbar-items">
        <div
          class="taskbar-item"
          *ngFor="let modal of minimizedModals; trackBy: trackByModalId"
          (click)="restoreModal(modal.id)"
          [title]="getTooltip(modal)"
        >
          <div class="modal-icon">🗔</div>
          <div class="modal-title">{{ getDisplayTitle(modal.title) }}</div>
          <div class="close-btn" (click)="closeModal($event, modal.id)" title="关闭">×</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-taskbar {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .taskbar-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .taskbar-items {
      display: flex;
      gap: 8px;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .taskbar-items::-webkit-scrollbar {
      display: none;
    }

    .taskbar-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 200px;
      max-width: 250px;
      position: relative;

      &:hover {
        background: #e6f7ff;
        border-color: #91d5ff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .modal-icon {
      font-size: 16px;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .modal-title {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .close-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      background: transparent;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: #ff4d4f;
        color: white;
      }
    }

    @media (max-width: 768px) {
      .modal-taskbar {
        left: 10px;
        right: 10px;
        bottom: 10px;
      }

      .taskbar-item {
        min-width: 150px;
        max-width: 180px;
      }

      .taskbar-title {
        display: none;
      }
    }
  `]
})
export class TaskbarComponent implements OnInit, OnDestroy {
  minimizedModals: MinimizedModal[] = [];
  private destroy$ = new Subject<void>();

  constructor(private minimizedModalService: MinimizedModalService) {}

  ngOnInit() {
    console.log('TaskbarComponent initialized');
    this.minimizedModalService.getMinimizedModals()
      .pipe(takeUntil(this.destroy$))
      .subscribe(modals => {
        console.log('TaskbarComponent received modals:', modals);
        this.minimizedModals = modals;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByModalId(index: number, modal: MinimizedModal): string {
    return modal.id;
  }

  restoreModal(id: string) {
    const modal = this.minimizedModalService.restoreModal(id);
    if (modal && modal.modalRef) {
      // 还原模态框显示
      modal.modalRef.restore();
    }
  }

  closeModal(event: Event, id: string) {
    event.stopPropagation(); // 阻止冒泡到还原事件

    const modal = this.minimizedModalService.restoreModal(id);
    if (modal && modal.modalRef) {
      // 直接关闭模态框
      modal.modalRef.close();
    }
  }

  getDisplayTitle(title: string): string {
    if (!title) return '未命名窗口';

    // 去除HTML标签
    const cleanTitle = title.replace(/<[^>]*>/g, '');

    // 限制长度
    return cleanTitle.length > 20 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
  }

  getTooltip(modal: MinimizedModal): string {
    const cleanTitle = modal.title.replace(/<[^>]*>/g, '');
    const time = modal.minimizedAt.toLocaleTimeString();
    return `${cleanTitle}\n最小化时间: ${time}`;
  }
}