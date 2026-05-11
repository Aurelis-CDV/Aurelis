import { Component, input } from '@angular/core';

@Component({
  selector: 'aurelis-heart-icon',
  imports: [],
  templateUrl: './heart.html',
  styleUrl: './heart.scss',
  host: {
    '[class.filled]': 'filled()',
  },
})
export class Heart {
  public readonly filled = input<boolean>(false);
}
