import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Layout } from './core/layout/layout';
import { Loading } from './shared/components/loading/loading';

@Component({
  imports: [Layout, Loading],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  showLoading = signal(true);
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadingTimeout = setTimeout(() => {
      this.showLoading.set(false);
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }
}
