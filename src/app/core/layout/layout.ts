import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "../../shared/components/sidebar/sidebar";
import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";
import { SidebarService } from '../../shared/services/sidebarService';

@Component({
  imports: [RouterOutlet, Sidebar, Header, Footer],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {

  sidebarOpen = inject(SidebarService);
  get sideState(): boolean {
    return this.sidebarOpen.sidebarOpen();
  }
  sideToggle() {
    this.sidebarOpen.toggleSidebar();
  }

}
