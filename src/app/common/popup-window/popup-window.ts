import { Component, input, output } from '@angular/core';
import { Close } from '../icons/close/close';
import { Refresh } from '../icons/refresh/refresh';

@Component({
  selector: 'aurelis-popup-window',
  imports: [Close, Refresh],
  templateUrl: './popup-window.html',
  styleUrl: './popup-window.scss',
})
export class PopupWindow {
  public readonly showRefresh = input<boolean>(false);

  public readonly closeWindow = output<void>();
  public readonly refreshClick = output<void>();

  protected onClose(): void {
    this.closeWindow.emit();
  }

  protected onRefresh(): void {
    this.refreshClick.emit();
  }
}
