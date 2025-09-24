# NgDraggableModal

A powerful Angular modal library with drag, resize, and fullscreen capabilities.

## Features

- 🚀 **Drag & Drop**: Fully draggable modal windows
- 📏 **Resizable**: Resize modals by dragging edges and corners
- 🖥️ **Fullscreen**: Toggle fullscreen mode
- 🎯 **Flexible Configuration**: Enable/disable features as needed
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎨 **Customizable**: Supports custom content and styling
- ⚡ **High Performance**: Optimized for smooth animations
- 🔧 **API Compatible**: Drop-in replacement for ng-zorro-antd modals

## Installation

```bash
npm install ng-draggable-modal
```

## Usage

### Basic Setup

1. Import the module in your app:

```typescript
import { NgDraggableModalModule } from 'ng-draggable-modal';

@NgModule({
  imports: [
    NgDraggableModalModule
  ]
})
export class AppModule { }
```

2. Add the taskbar component to your app component template:

```html
<router-outlet></router-outlet>
<app-modal-taskbar></app-modal-taskbar>
```

### Basic Usage

```typescript
import { EnhancedModalService } from 'ng-draggable-modal';

constructor(private modal: EnhancedModalService) {}

openModal() {
  this.modal.create({
    nzTitle: 'Draggable Modal',
    nzContent: 'This modal can be dragged, resized, and maximized!',
    nzWidth: 600
  });
}
```

### Configuration Options

```typescript
this.modal.create({
  nzTitle: 'Custom Modal',
  nzContent: MyComponent,
  nzWidth: 800,

  // Feature toggles (all default to true)
  draggable: true,          // Enable/disable dragging
  resizable: true,          // Enable/disable resizing
  showFullscreenButton: true, // Show/hide fullscreen button

  // Standard modal options
  nzOkText: 'Confirm',
  nzCancelText: 'Cancel',
  nzOnOk: () => console.log('OK clicked'),
  nzOnCancel: () => console.log('Cancel clicked')
});
```

### Confirmation Dialogs

```typescript
this.modal.confirm({
  nzTitle: 'Confirm Action',
  nzContent: 'Are you sure you want to proceed?',
  nzIconType: 'question-circle',

  // Disable interactions for simple confirmations
  draggable: false,
  resizable: false,
  showFullscreenButton: false,

  nzOnOk: () => {
    // Handle confirmation
  }
});
```

## API Reference

### DraggableModalConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nzTitle` | `string \| TemplateRef` | - | Modal title |
| `nzContent` | `string \| TemplateRef \| Component` | - | Modal content |
| `nzWidth` | `number \| string` | `600` | Modal width |
| `draggable` | `boolean` | `true` | Enable dragging |
| `resizable` | `boolean` | `true` | Enable resizing |
| `showFullscreenButton` | `boolean` | `true` | Show fullscreen button |
| `nzOkText` | `string \| null` | `'确定'` | OK button text |
| `nzCancelText` | `string \| null` | `'取消'` | Cancel button text |
| `nzOnOk` | `() => any` | - | OK callback |
| `nzOnCancel` | `() => any` | - | Cancel callback |

### EnhancedModalService

| Method | Description |
|--------|-------------|
| `create(config)` | Create a modal |
| `confirm(config)` | Create a confirmation dialog |
| `info(config)` | Create an info dialog |
| `success(config)` | Create a success dialog |
| `warning(config)` | Create a warning dialog |
| `error(config)` | Create an error dialog |

## Examples

### Custom Component Modal

```typescript
@Component({
  template: `
    <div>
      <h3>Custom Content</h3>
      <p>This is a custom component inside the modal.</p>
    </div>
  `
})
export class CustomModalComponent { }

// Usage
this.modal.create({
  nzTitle: 'Custom Component Modal',
  nzContent: CustomModalComponent,
  nzWidth: 800
});
```

### Non-Interactive Modal

```typescript
this.modal.create({
  nzTitle: 'Information',
  nzContent: 'This modal cannot be moved or resized.',
  draggable: false,
  resizable: false,
  showFullscreenButton: false,
  nzOkText: 'Got it',
  nzCancelText: null
});
```

## License

MIT © littlefly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.