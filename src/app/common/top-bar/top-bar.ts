import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../icons/book/book';

@Component({
  selector: 'aurelis-top-bar',
  imports: [Book, RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {}
