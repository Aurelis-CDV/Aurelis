import { Component, input, output } from '@angular/core';

@Component({
  selector: 'aurelis-guides-pagination',
  templateUrl: './guides-pagination.html',
  styleUrl: './guides-pagination.scss',
})
export class GuidesPagination {
  public readonly currentPage = input.required<number>();
  public readonly lastPage = input.required<number>();

  public readonly pageChange = output<number>();

  public goPrevious(): void {
    const prev = this.currentPage() - 1;
    if (prev >= 1) {
      this.pageChange.emit(prev);
    }
  }

  public goNext(): void {
    const next = this.currentPage() + 1;
    if (next <= this.lastPage()) {
      this.pageChange.emit(next);
    }
  }
}
