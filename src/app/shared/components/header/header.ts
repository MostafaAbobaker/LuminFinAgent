import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebarService';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  sideState : boolean = false;
  sidebarOpen = inject(SidebarService);

  sideToggle() {
    this.sideState = !this.sideState;
    this.sidebarOpen.toggleSidebar();
  }
  ngOnInit(): void {
    this.sideState = this.sidebarOpen.sidebarOpen();
  }
}
