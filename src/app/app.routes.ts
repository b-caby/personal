import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResumeComponent } from './resume/resume.component';
import { TravelsComponent } from './travels/travels.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'resume', component: ResumeComponent},
    {path: 'travels', component: TravelsComponent},
    {path: '', redirectTo: '/home', pathMatch: 'prefix' },
];
