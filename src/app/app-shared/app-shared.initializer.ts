import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { GlobalConstants, FixedIDs } from '../index';
import { lastValueFrom } from 'rxjs';
import { Loader } from '@googlemaps/js-api-loader';
import { AdminService } from './services/admin.service';



