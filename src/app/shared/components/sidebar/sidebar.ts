import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebarService';

@Component({
  imports: [],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {

  sidebarOpen = inject(SidebarService);


  get sideState(): boolean {
    return this.sidebarOpen.sidebarOpen();
  }
}
