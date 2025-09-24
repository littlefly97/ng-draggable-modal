# ng-draggable-modal

A powerful Angular modal library with drag, resize, and fullscreen capabilities. **100% compatible with ng-zorro-antd Modal API** - drop-in replacement for NzModalService.

## 🎯 Key Features

- 🚀 **Drag & Drop**: Fully draggable modal windows
- 📏 **Resizable**: Resize modals by dragging edges and corners
- 🖥️ **Fullscreen**: Toggle fullscreen mode with restore capability
- 🔄 **100% ng-zorro Compatible**: Drop-in replacement for NzModalService
- 🎨 **Rich Button Options**: Support for various button types, states, and custom arrays
- 🎭 **Comprehensive Styling**: Full support for masks, positioning, and custom styles
- ⌨️ **Keyboard Support**: ESC key handling and focus management
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- ⚡ **High Performance**: Optimized animations and change detection
- 🛡️ **Type Safe**: Full TypeScript support with comprehensive interfaces

## Version Compatibility

| Angular Version | ng-draggable-modal | Status |
|----------------|--------------------|---------|
| 10.x           | ✅ 1.0.x+         | Supported |
| 11.x           | ✅ 1.0.x+         | Supported |
| 12.x           | ✅ 1.0.x+         | Supported |
| 13.x           | ✅ 1.0.x+         | Supported |
| 14.x           | ✅ 1.0.x+         | Supported |
| 15.x           | ✅ 1.0.x+         | Supported |
| 16.x           | ✅ 1.0.x+         | Supported |

- **RxJS**: Supports versions 6.x and 7.x
- **TypeScript**: Compatible with versions used by corresponding Angular versions

## Installation

```bash
npm install ng-draggable-modal
```

## Quick Start

### 1. Import Module

```typescript
import { NgDraggableModalModule } from 'ng-draggable-modal';

@NgModule({
  imports: [
    NgDraggableModalModule
  ]
})
export class AppModule { }
```

### 2. Add Taskbar Component (Required for Minimize Feature)

```html
<!-- Add to your app.component.html or root template -->
<router-outlet></router-outlet>

<!-- Taskbar for minimized modals - shows at bottom of screen -->
<ng-modal-taskbar></ng-modal-taskbar>
```

**⚠️ Important**: Without the taskbar component, minimized modals cannot be restored!

### 3. Use the Service

```typescript
import { EnhancedModalService } from 'ng-draggable-modal';

constructor(private modal: EnhancedModalService) {}

openModal() {
  const modalRef = this.modal.create({
    nzTitle: 'Draggable Modal',
    nzContent: 'This modal can be dragged, resized, and maximized!',
    nzWidth: 600,
    nzCentered: true,
    nzMaskClosable: true,
    nzKeyboard: true
  });

  modalRef.afterOpen.subscribe(() => console.log('Modal opened'));
  modalRef.afterClose.subscribe(result => console.log('Closed:', result));
}
```

## 🔧 Complete ng-zorro API Support

### Service Methods

```typescript
// All standard ng-zorro methods supported
this.modal.create(config);           // Create custom modal
this.modal.confirm(config);          // Confirmation dialog
this.modal.info(config);            // Info dialog
this.modal.success(config);         // Success dialog
this.modal.warning(config);         // Warning dialog
this.modal.error(config);           // Error dialog
this.modal.closeAll();              // Close all modals
this.modal.afterAllClose();         // Observable for all closed
this.modal.getOpenModals();         // Get all open modal refs
```

### Modal Reference Methods

```typescript
const modalRef = this.modal.create(config);

// ng-zorro compatible methods
modalRef.close(result);              // Close with result
modalRef.destroy();                  // Destroy modal
modalRef.getContentComponent();      // Get component instance
modalRef.getContentComponentRef();   // Get component ref
modalRef.triggerOk();               // Trigger OK button
modalRef.triggerCancel();           // Trigger Cancel button
modalRef.updateConfig(newConfig);    // Update configuration

// Event observables
modalRef.afterOpen.subscribe(() => {});
modalRef.afterClose.subscribe(result => {});
```

## 📋 Configuration Options

### Basic Properties

```typescript
interface DraggableModalConfig {
  // Content
  nzTitle?: string | TemplateRef<any>;
  nzContent?: string | TemplateRef<any> | Type<any>;
  nzComponentParams?: any;

  // Size and Position
  nzWidth?: number | string;
  nzCentered?: boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };

  // Styling
  nzBodyStyle?: { [key: string]: string };
  nzStyle?: { [key: string]: string };
  nzMaskStyle?: { [key: string]: string };
  nzClassName?: string;
  nzWrapClassName?: string;

  // Button Configuration
  nzOkText?: string | null;
  nzCancelText?: string | null;
  nzOkType?: 'primary' | 'default' | 'dashed' | 'danger';
  nzOkDanger?: boolean;
  nzOkLoading?: boolean;
  nzCancelLoading?: boolean;
  nzOkDisabled?: boolean;
  nzCancelDisabled?: boolean;

  // Custom Footer Buttons
  nzFooter?: string | TemplateRef<any> | ModalButtonOptions[] | null;

  // Interaction
  nzClosable?: boolean;
  nzCloseIcon?: string | TemplateRef<void>;
  nzMask?: boolean;
  nzMaskClosable?: boolean;
  nzKeyboard?: boolean;

  // Advanced
  nzZIndex?: number;
  nzDirection?: 'ltr' | 'rtl';
  nzAutofocus?: 'ok' | 'cancel' | 'auto' | null;
  nzCloseOnNavigation?: boolean;

  // Enhanced Features
  draggable?: boolean;                    // Default: true
  resizable?: boolean;                    // Default: true
  showFullscreenButton?: boolean;         // Default: true
  showMinimizeButton?: boolean;           // Default: false (must explicitly enable)
  defaultFullscreen?: boolean;            // Default: false
}
```

### Custom Button Array

```typescript
const modalRef = this.modal.create({
  nzTitle: 'Custom Buttons',
  nzContent: 'Modal with custom button array',
  nzFooter: [
    {
      label: 'Custom Action',
      type: 'primary',
      onClick: (componentInstance) => {
        console.log('Custom button clicked');
        return true; // Close modal
      }
    },
    {
      label: 'Async Action',
      type: 'default',
      autoLoading: true,
      onClick: () => {
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 2000);
        });
      }
    },
    {
      label: 'Danger Action',
      type: 'danger',
      danger: true,
      disabled: false,
      onClick: () => false // Don't close modal
    }
  ]
});
```

### Button Options Interface

```typescript
interface ModalButtonOptions {
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'danger' | 'link' | 'text';
  danger?: boolean;
  shape?: 'circle' | 'round';
  ghost?: boolean;
  size?: 'large' | 'default' | 'small';
  autoLoading?: boolean;
  show?: boolean | ((componentInstance?: object) => boolean);
  loading?: boolean | ((componentInstance?: object) => boolean);
  disabled?: boolean | ((componentInstance?: object) => boolean);
  onClick?(componentInstance?: object): void | Promise<void> | any;
}
```

## 🎨 Examples

### Custom Component Modal

```typescript
@Component({
  template: `
    <div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <input [(ngModel)]="inputValue" placeholder="Enter text">
    </div>
  `
})
export class CustomModalComponent {
  @Input() title = '';
  @Input() message = '';
  inputValue = '';
}

// Usage
const modalRef = this.modal.create({
  nzTitle: 'Custom Component Modal',
  nzContent: CustomModalComponent,
  nzComponentParams: {
    title: 'Dynamic Title',
    message: 'This is injected content'
  },
  nzWidth: 600,
  nzOkText: 'Save',
  nzOnOk: (instance) => {
    const component = instance as CustomModalComponent;
    console.log('Input value:', component.inputValue);
    return true;
  }
});
```

### Advanced Confirmation Dialog

```typescript
this.modal.confirm({
  nzTitle: 'Delete Confirmation',
  nzContent: 'Are you sure you want to delete this item? This action cannot be undone.',
  nzIconType: 'exclamation-circle',
  nzOkText: 'Delete',
  nzOkDanger: true,
  nzCancelText: 'Keep It',
  nzWidth: 460,
  nzMaskClosable: false,
  nzKeyboard: false,
  draggable: false,
  resizable: false,
  showFullscreenButton: false,

  nzOnOk: async () => {
    // Show loading state
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Item deleted');
        resolve(true);
      }, 2000);
    });
  }
});
```

### Rich Styling Modal

```typescript
this.modal.create({
  nzTitle: 'Styled Modal',
  nzContent: 'This modal has custom styling',
  nzWidth: 800,
  nzCentered: true,
  nzClassName: 'custom-modal-class',
  nzWrapClassName: 'custom-wrap-class',
  nzBodyStyle: {
    padding: '24px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  nzMaskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)'
  },
  nzStyle: {
    top: '20px'
  },
  nzZIndex: 1500
});
```

### Fullscreen Modal

```typescript
this.modal.create({
  nzTitle: 'Fullscreen Modal',
  nzContent: MyLargeComponent,
  defaultFullscreen: true,
  showMinimizeButton: true,
  nzFooter: null, // No footer buttons
  nzClosable: true
});
```

## 🔄 Migration from ng-zorro

Simply replace `NzModalService` with `EnhancedModalService`:

```typescript
// Before (ng-zorro)
import { NzModalService } from 'ng-zorro-antd/modal';
constructor(private modal: NzModalService) {}

// After (ng-draggable-modal)
import { EnhancedModalService } from 'ng-draggable-modal';
constructor(private modal: EnhancedModalService) {}

// All existing code works without changes!
```

## 🎭 Minimized Modals

Modals can be minimized to a taskbar that appears at the bottom of the screen:

### Setup Minimization Feature

1. **Add taskbar to your template** (required):
```html
<!-- In app.component.html -->
<ng-modal-taskbar></ng-modal-taskbar>
```

2. **Enable minimize button on modals** (disabled by default):
```typescript
const modalRef = this.modal.create({
  nzTitle: 'Minimizable Modal',
  nzContent: 'This modal can be minimized',
  showMinimizeButton: true  // Must explicitly set to true (default: false)
});
```

3. **Programmatically control**:
```typescript
// Minimize modal
modalRef._modalComponent?.minimize();

// Restore modal
modalRef._modalComponent?.restore();
```

### Taskbar Features

- **📍 Position**: Fixed at bottom of screen
- **🎯 Click to Restore**: Click any taskbar item to restore the modal
- **❌ Quick Close**: Click the × button to close without restoring
- **📱 Responsive**: Automatically adapts to mobile screens
- **🔄 Auto-Hide**: Taskbar only appears when modals are minimized

The taskbar shows:
- Modal title (truncated if too long)
- Minimize timestamp on hover
- Close button for each modal
- Responsive design for mobile devices

## 📚 Advanced Features

### Event Handling

```typescript
const modalRef = this.modal.create(config);

// Standard events
modalRef.afterOpen.subscribe(() => {
  console.log('Modal fully opened');
});

modalRef.afterClose.subscribe(result => {
  console.log('Modal closed with result:', result);
});

// Service-level events
this.modal.afterAllClose().subscribe(() => {
  console.log('All modals have been closed');
});
```

### Dynamic Updates

```typescript
const modalRef = this.modal.create({
  nzTitle: 'Dynamic Modal',
  nzContent: 'Initial content',
  nzOkText: 'Next'
});

// Update configuration
modalRef.updateConfig({
  nzTitle: 'Updated Title',
  nzContent: 'New content',
  nzOkText: 'Finish'
});
```

### Programmatic Control

```typescript
const modalRef = this.modal.create(config);

// Trigger buttons programmatically
modalRef.triggerOk();
modalRef.triggerCancel();

// Access component instance
const component = modalRef.getContentComponent();
const componentRef = modalRef.getContentComponentRef();

// Close with result
modalRef.close({ action: 'save', data: {...} });
```

## 🔧 Customization

### CSS Classes

The library provides CSS classes for custom styling:

```css
.draggable-modal-mask { /* Backdrop */ }
.draggable-modal-container { /* Modal container */ }
.modal-header { /* Header area */ }
.modal-content { /* Content area */ }
.modal-body { /* Body content */ }
.modal-footer { /* Footer buttons */ }
.btn { /* Button base */ }
.btn-primary, .btn-danger, .btn-dashed { /* Button variants */ }
```

### Feature Toggles

```typescript
// Disable all enhancements for standard modal behavior
this.modal.create({
  nzTitle: 'Standard Modal',
  nzContent: 'Behaves like a standard modal',
  draggable: false,
  resizable: false,
  showFullscreenButton: false,
  showMinimizeButton: false
});
```

## 🐛 Troubleshooting

### Common Issues

1. **ViewChild errors**: Ensure you're using Angular 10+
2. **Missing content**: Check that components are declared in your module
3. **Styling issues**: Verify CSS imports and z-index conflicts
4. **Minimized modals disappear**: Make sure you've added `<ng-modal-taskbar></ng-modal-taskbar>` to your template
5. **Taskbar not showing**: Verify the NgDraggableModalModule is imported correctly

### Performance Tips

- Use `OnPush` change detection for modal content components
- Minimize DOM updates in modal content
- Use `trackBy` functions for lists inside modals

## 📄 License

MIT © littlefly

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/littlefly/ng-draggable-modal.git
cd ng-draggable-modal
npm install
npm run build
```

## 📊 Bundle Size

- **Compressed**: ~179 kB
- **Uncompressed**: ~747 kB
- **Dependencies**: Angular Common, RxJS only

## 🔗 Links

- [GitHub Repository](https://github.com/littlefly97/ng-draggable-modal)
- [NPM Package](https://www.npmjs.com/package/ng-draggable-modal)
- [Issues & Bug Reports](https://github.com/littlefly97/ng-draggable-modal/issues)