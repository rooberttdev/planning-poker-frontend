import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RoomComponent } from './components/room/room.component';
import { RoomJoinComponent } from './components/room-join/room-join.component';
import { RoomSetupComponent } from './components/room-setup/room-setup.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'setup', component: RoomSetupComponent },
  { path: 'join/:id', component: RoomJoinComponent },
  { path: 'room/:id', component: RoomComponent },
  { path: '**', redirectTo: '' },
];
