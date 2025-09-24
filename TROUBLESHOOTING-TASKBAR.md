# 🔧 任务栏问题排查指南

如果最小化后没有显示任务栏，请按以下步骤排查：

## ✅ 步骤1: 检查任务栏组件是否已添加

**在 app.component.html 中确保添加了任务栏组件：**

```html
<div class="app-content">
  <!-- 你的应用内容 -->
  <router-outlet></router-outlet>
</div>

<!-- 必须添加这一行！ -->
<ng-modal-taskbar></ng-modal-taskbar>
```

⚠️ **注意**: 选择器已更新为 `ng-modal-taskbar`（不是 `app-modal-taskbar`）

## ✅ 步骤2: 检查模块导入

**在 app.module.ts 中确保导入了模块：**

```typescript
import { NgDraggableModalModule } from 'ng-draggable-modal';

@NgModule({
  imports: [
    BrowserModule,
    NgDraggableModalModule  // 必须导入
  ]
})
export class AppModule { }
```

## ✅ 步骤3: 启用最小化按钮 (重要！)

**最小化按钮默认是关闭的，必须显式启用：**

```typescript
const modalRef = this.modal.create({
  nzTitle: '测试模态框',
  nzContent: '这是测试内容',
  showMinimizeButton: true  // 必须显式设置为 true (默认: false)
});
```

⚠️ **重要**: `showMinimizeButton` 默认为 `false`，如果不设置为 `true`，最小化按钮不会显示！
```

## ✅ 步骤4: 检查控制台日志

**打开浏览器开发者工具，查看控制台是否有以下日志：**

当创建模态框时：
- 应该看到：`TaskbarComponent initialized`

当点击最小化时：
- 应该看到：`DraggableModalComponent: minimize() called for modal: modal_xxx`
- 应该看到：`MinimizedModalService: Adding modal to minimized list:`
- 应该看到：`TaskbarComponent received modals: [...]`

## ✅ 步骤5: 检查CSS样式

**确保任务栏没有被其他CSS隐藏：**

```css
/* 检查是否有这些样式影响任务栏 */
ng-modal-taskbar {
  display: block !important;
  z-index: 9999 !important;
}
```

## 🔍 调试测试代码

**完整的测试代码示例：**

### app.component.html
```html
<div class="container">
  <h1>任务栏测试</h1>
  <button (click)="openTestModal()" class="test-btn">
    打开可最小化模态框
  </button>
</div>

<!-- 任务栏组件 - 必须存在 -->
<ng-modal-taskbar></ng-modal-taskbar>

<style>
.container {
  padding: 20px;
}

.test-btn {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-btn:hover {
  background: #40a9ff;
}
</style>
```

### app.component.ts
```typescript
import { Component } from '@angular/core';
import { EnhancedModalService } from 'ng-draggable-modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private modal: EnhancedModalService) {}

  openTestModal() {
    console.log('Creating test modal...');

    const modalRef = this.modal.create({
      nzTitle: '测试任务栏功能',
      nzContent: '点击标题栏左侧的 "−" 按钮来最小化这个模态框。最小化后应该在屏幕底部显示任务栏。',
      nzWidth: 600,
      showMinimizeButton: true,  // 启用最小化按钮
      draggable: true,
      resizable: true,
      nzOkText: '确定',
      nzCancelText: '取消'
    });

    console.log('Modal created:', modalRef);
  }
}
```

### app.module.ts
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgDraggableModalModule } from 'ng-draggable-modal';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgDraggableModalModule  // 必须导入
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 🐛 常见问题

### 1. 任务栏组件未显示
**原因**: 未添加 `<ng-modal-taskbar></ng-modal-taskbar>`
**解决**: 在根模板中添加任务栏组件

### 2. 最小化按钮不存在 (最常见)
**原因**: `showMinimizeButton` 默认为 `false`，必须显式设置为 `true`
**解决**: 在模态框配置中添加 `showMinimizeButton: true`

### 3. 点击最小化没有反应
**原因**: 模块未正确导入
**解决**: 确保在 app.module.ts 中导入了 NgDraggableModalModule

### 4. 任务栏样式异常
**原因**: CSS 冲突或 z-index 问题
**解决**: 检查自定义 CSS 是否影响任务栏显示

### 5. 控制台报错
**原因**: Angular 版本不兼容或依赖缺失
**解决**: 确保使用 Angular 10+ 和正确的 RxJS 版本

## 📞 获取帮助

如果按照以上步骤仍然无法解决问题，请：

1. **检查版本**: 确保使用的是 v1.0.14 或更高版本
2. **查看控制台**: 提供完整的控制台输出
3. **提供代码**: 分享你的组件和模块配置
4. **描述环境**: Angular 版本、浏览器版本等

## ✨ 成功标志

当一切正常工作时，你应该看到：

1. ✅ 模态框标题栏有最小化按钮 "−"
2. ✅ 点击最小化按钮后模态框消失
3. ✅ 屏幕底部出现任务栏
4. ✅ 任务栏显示模态框标题
5. ✅ 点击任务栏项目可恢复模态框
6. ✅ 点击任务栏 "×" 可关闭模态框

**任务栏应该看起来像这样：**
```
┌──────────────────────────────────────┐
│ 最小化窗口  [🗔 测试模态框     ×]      │
└──────────────────────────────────────┘
```