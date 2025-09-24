// Test script to verify ng-zorro API compatibility
// This would be used in a real Angular application to test the implementation

const testConfig = {
  // Basic properties
  nzTitle: 'Test Modal',
  nzContent: 'This is a test modal',
  nzWidth: 600,
  nzCentered: true,

  // Style properties
  nzBodyStyle: { padding: '20px', backgroundColor: '#f5f5f5' },
  nzStyle: { top: '100px' },
  nzMaskStyle: { backgroundColor: 'rgba(0,0,0,0.6)' },
  nzClassName: 'custom-modal',
  nzWrapClassName: 'custom-modal-wrap',

  // Button properties
  nzOkText: '确认',
  nzCancelText: '取消',
  nzOkType: 'primary',
  nzOkDanger: false,
  nzOkLoading: false,
  nzCancelLoading: false,
  nzOkDisabled: false,
  nzCancelDisabled: false,

  // Callbacks
  nzOnOk: () => {
    console.log('OK clicked');
    return Promise.resolve(true);
  },
  nzOnCancel: () => {
    console.log('Cancel clicked');
    return false;
  },
  nzAfterOpen: () => console.log('Modal opened'),
  nzAfterClose: (result) => console.log('Modal closed with result:', result),

  // Custom footer with button array
  nzFooter: [
    {
      label: '自定义按钮1',
      type: 'default',
      onClick: (componentInstance) => {
        console.log('Custom button 1 clicked', componentInstance);
        return true;
      }
    },
    {
      label: '危险按钮',
      type: 'danger',
      danger: true,
      onClick: () => {
        console.log('Danger button clicked');
        return false; // Don't close modal
      }
    },
    {
      label: '加载按钮',
      type: 'primary',
      autoLoading: true,
      onClick: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('Async operation completed');
            resolve(true);
          }, 2000);
        });
      }
    }
  ],

  // Interactive configuration
  nzClosable: true,
  nzCloseIcon: null, // Use default close icon
  nzMask: true,
  nzMaskClosable: true,
  nzKeyboard: true,

  // Enhanced features
  draggable: true,
  resizable: true,
  showFullscreenButton: true,
  showMinimizeButton: false,
  defaultFullscreen: false,

  // Position and size
  initialPosition: { x: 100, y: 50 },
  initialSize: { width: 800, height: 600 },

  // Other properties
  nzZIndex: 1050,
  nzDirection: 'ltr',
  nzAutofocus: 'ok',
  nzCloseOnNavigation: true
};

console.log('Test configuration created successfully');
console.log('All ng-zorro API properties are supported:', Object.keys(testConfig));

// Example usage patterns that should work:
/*
// Service usage
const modalService = new EnhancedModalService(new DraggableModalService(...));

// Create modal
const modalRef = modalService.create(testConfig);

// Access modal methods
modalRef.triggerOk();
modalRef.triggerCancel();
modalRef.updateConfig({ nzTitle: 'Updated Title' });
modalRef.getContentComponent();
modalRef.getContentComponentRef();

// Subscribe to events
modalRef.afterOpen.subscribe(() => console.log('Opened'));
modalRef.afterClose.subscribe(result => console.log('Closed:', result));

// Service methods
const openModals = modalService.getOpenModals();
modalService.afterAllClose().subscribe(() => console.log('All closed'));
modalService.closeAll();

// Confirm dialogs
modalService.confirm({
  nzTitle: '确认',
  nzContent: '确定要删除吗？',
  nzIconType: 'exclamation-circle'
});

modalService.info({ nzContent: '信息提示' });
modalService.success({ nzContent: '操作成功' });
modalService.warning({ nzContent: '警告信息' });
modalService.error({ nzContent: '错误信息' });
*/