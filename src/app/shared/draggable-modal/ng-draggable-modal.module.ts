import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraggableModalComponent } from './draggable-modal.component';
import { DraggableModalService } from './draggable-modal.service';
import { EnhancedModalService } from './enhanced-modal.service';
import { TaskbarComponent } from './taskbar.component';
import { MinimizedModalService } from './minimized-modal.service';

@NgModule({
  declarations: [
    DraggableModalComponent,
    TaskbarComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    DraggableModalService,
    EnhancedModalService,
    MinimizedModalService
  ],
  exports: [
    DraggableModalComponent,
    TaskbarComponent
  ]
})
export class NgDraggableModalModule { }