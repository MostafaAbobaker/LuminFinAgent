import { Component, signal } from '@angular/core';
import { Layout } from './core/layout/layout';

@Component({
  imports: [Layout],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
