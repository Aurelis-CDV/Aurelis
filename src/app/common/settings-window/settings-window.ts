import { Component, output } from '@angular/core';
import { PopupWindow } from '../popup-window/popup-window';

@Component({
  selector: 'aurelis-settings-window',
  imports: [PopupWindow],
  templateUrl: './settings-window.html',
  styleUrl: './settings-window.scss',
})
export class SettingsWindow {
  readonly closed = output<void>();

  protected onClose(): void {
    this.closed.emit();
  }
}
