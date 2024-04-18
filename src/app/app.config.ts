import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ResumeService } from './resume/service/resume.service';
import { TravelService } from './travels/service/travels.service';
import { MapHelper } from './travels/service/map.helper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    ResumeService,
    TravelService,
    MapHelper
  ]
};
