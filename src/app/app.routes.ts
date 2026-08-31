import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { Home } from './features/pages/home/home';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path:'home', component:Home},
  {path:'**' , component:NotFound}

];
