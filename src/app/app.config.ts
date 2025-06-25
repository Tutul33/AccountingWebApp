import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ToastrModule } from 'ngx-toastr';
import { 
  provideHttpClient, 
  withInterceptors 
} from '@angular/common/http';
import { HeadersInterceptor } from './core/services/http-interceptor.service';
import { HttpErrorInterceptor } from './core/services/http-error.Interceptor';
import { EncodeHttpParamsInterceptor } from './core/services/encodeHttpParams.interceptor';
import { MessageService } from 'primeng/api';
import { ErrorLogService } from './shared/services/error-log.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModule } from './login/login.module';
import { ProviderService } from './shared';


export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    ProviderService,
    importProvidersFrom(
      BrowserAnimationsModule,   
      ToastrModule.forRoot(),
      LoginModule
    ),

    // Provide HTTP interceptors
    provideHttpClient(
      withInterceptors([
        HeadersInterceptor,
        HttpErrorInterceptor,
        EncodeHttpParamsInterceptor,
      ])
    ),

    // Other Services
    MessageService,
    { provide: ErrorHandler, useClass: ErrorLogService },
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
  ]
};

