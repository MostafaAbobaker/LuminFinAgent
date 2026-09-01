import { Service, signal } from '@angular/core';

@Service()
export class SidebarService {

  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
