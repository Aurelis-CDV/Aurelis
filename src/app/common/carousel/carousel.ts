import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { Arrow } from '../icons/arrow/arrow';

@Component({
  selector: 'aurelis-carousel',
  imports: [Arrow],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel implements AfterViewInit, AfterViewChecked, OnChanges {
  @Input()
  public currentIndex = 0;

  @Input()
  public layoutRevision = 0;

  private items = viewChild<ElementRef>('items');

  private previousProjectedChildCount: number | null = null;

  constructor(private readonly elementRef: ElementRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['layoutRevision'] && !changes['layoutRevision'].firstChange) {
      this.currentIndex = 0;
      queueMicrotask(() => this.applySlideLayoutForCurrentIndex());
    }
  }

  public ngAfterViewInit() {
    this.previousProjectedChildCount = this.getItemsLength();
    this.applySlideLayoutForCurrentIndex();
  }

  public ngAfterViewChecked() {
    const count = this.getItemsLength();
    if (this.previousProjectedChildCount === null) {
      this.previousProjectedChildCount = count;
      return;
    }
    if (count !== this.previousProjectedChildCount) {
      this.previousProjectedChildCount = count;
      if (count > 0) {
        this.currentIndex = 0;
        queueMicrotask(() => this.applySlideLayoutForCurrentIndex());
      }
    }
  }

  private applySlideLayoutForCurrentIndex(): void {
    this.getDots();
    const items: any = this.getItems();
    if (!items?.length) {
      return;
    }
    if (this.currentIndex >= items.length) {
      this.currentIndex = 0;
    }
    items.forEach((item: any, index: number) => {
      switch (index) {
        case this.currentIndex: {
          this.setActiveItemStyles(item);
          break;
        }
        case this.currentIndex + 1: {
          this.setPreviouslyActiveItemStyles(item);
          break;
        }
        default: {
          this.setInactiveItemStyles(item);
        }
      }
    });
  }

  public prevItem() {
    const items = this.getItems();

    if (!items.length) {
      return;
    }

    const prevIndex = this.currentIndex;
    this.currentIndex = this.currentIndex - 1;

    if (this.currentIndex < 0) {
      this.currentIndex = this.getItemsLength() - 1;
    }

    items.forEach((item: any, index: number) => {
      switch (index) {
        case this.currentIndex: {
          this.setActiveItemStyles(item);
          break;
        }
        case prevIndex: {
          this.setPreviouslyActiveItemStyles(item, '100%');
          break;
        }
        default: {
          this.setInactiveItemStyles(item, '-100%');
        }
      }
    });
  }

  public nextItem() {
    const items = this.getItems();

    if (!items.length) {
      return;
    }

    const prevIndex = this.currentIndex;
    this.currentIndex = this.currentIndex + 1;

    if (this.currentIndex > this.getItemsLength() - 1) {
      this.currentIndex = 0;
    }

    items.forEach((item: any, index: number) => {
      switch (index) {
        case this.currentIndex: {
          this.setActiveItemStyles(item);
          break;
        }
        case prevIndex: {
          this.setPreviouslyActiveItemStyles(item, '-100%');

          break;
        }
        default: {
          this.setInactiveItemStyles(item, '100%');
        }
      }
    });
  }

  public getDots() {
    const len = this.getItemsLength();
    const arr = [];

    for (let i = 0; i < len; i++) {
      arr.unshift(i);
    }

    return arr;
  }

  public isDotActive(dot: number) {
    return this.currentIndex === Math.abs(this.getItemsLength() - 1 - dot);
  }

  private getItemsLength() {
    return this.items()?.nativeElement.childElementCount;
  }

  private getItems() {
    return Array.from(this.items()?.nativeElement.childNodes).filter(
      (item: any) => item.nodeType !== 8,
    );
  }

  private setActiveItemStyles(item: any) {
    item.style.left = '0';
    item.classList?.add('active');
    item.classList?.remove('inActive');
    item.classList?.remove('prevActive');
  }

  private setPreviouslyActiveItemStyles(item: any, positionLeft: string = '100%') {
    item.style.left = positionLeft;
    item.classList?.add('prevActive');
    item.classList?.remove('active');
    item.classList?.remove('inActive');
  }

  private setInactiveItemStyles(item: any, positionLeft: string = '-100%') {
    item.style.left = positionLeft;
    item.classList?.add('inActive');
    item.classList?.remove('prevActive');
    item.classList?.remove('active');
  }
}
