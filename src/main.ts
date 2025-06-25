import { ApplicationConfig, enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication,} from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { loadFieldTitle, loadValidation, loadErrorMessage, setServerDate, setSignalRConnection } from './app/core/models/app.initializer';
import "./app/core/models/extensions";
import './app/app-shared/models/fixedIDs';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { DialogService } from 'primeng/dynamicdialog';

if (environment.production) {
  enableProdMode();
}

// Extend appConfig with APP_INITIALIZER functions
const extendedAppConfig: ApplicationConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    loadFieldTitle,
    loadValidation,
    loadErrorMessage,
    setServerDate,
    setSignalRConnection,
    DialogService,
    providePrimeNG({
      theme: {
          preset: Aura
      },      
    })
  ]
};

bootstrapApplication(AppComponent, extendedAppConfig).catch(err => console.error(err));