import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { Arrow } from '../icons/arrow/arrow';

@Component({
  selector: 'aurelis-carousel',
  imports: [Arrow],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel implements AfterViewInit {
  public currentIndex = 0;

  private items = viewChild<ElementRef>('items');

  constructor(private readonly elementRef: ElementRef) {}

  public ngAfterViewInit() {
    this.getDots();
    const itemsNodes: any = this.items()?.nativeElement.childNodes;

    itemsNodes.forEach((item: any, index: number) => {
      switch (index) {
        case 0: {
          item.classList?.add('active');
          break;
        }
        default: {
          item.classList?.add('inActive');
        }
      }
    });
  }

  public prevItem() {
    this.currentIndex--;
  }

  public nextItem() {
    const prevIndex = this.currentIndex;

    this.currentIndex++;

    if (this.currentIndex > this.getItemsLength() - 1) {
      this.currentIndex = 0;
    }

    const itemsNodes: NodeListOf<ChildNode> = this.items()?.nativeElement.childNodes;

    if (!itemsNodes.length) {
      return;
    }

    itemsNodes.forEach((item: any, index: number) => {
      switch (index) {
        case this.currentIndex: {
          item.classList?.add('active');
          item.classList.remove('inActive');
          break;
        }
        case prevIndex: {
          item.classList?.add('prevActive');
          item.classList?.remove('active');
          break;
        }
        default: {
          item.classList?.add('inActive');
          item.classList?.remove('prevActive');
        }
      }
    });
  }

  public getItemsLength() {
    return this.items()?.nativeElement.childElementCount;
  }

  public getDots() {
    const len = this.getItemsLength();
    const arr = new Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = i;
    }

    return arr;
  }

  public isDotActive(dot: number) {
    return this.currentIndex === dot;
  }
}
