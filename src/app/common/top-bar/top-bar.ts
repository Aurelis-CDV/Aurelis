import { Component } from '@angular/core';
import { Book } from '../icons/book/book';

@Component({
  selector: 'aurelis-top-bar',
  imports: [Book],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {}
