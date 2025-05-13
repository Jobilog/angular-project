import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() title: string = 'Delete Comment';
  @Input() show: boolean = false;

  @Output() delete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onDelete() {
    this.delete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
