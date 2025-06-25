//Load validation messages// 
import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';

import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../services/config.service';

function loadErrorMessageList(configService: ConfigService) {
  return async (): Promise<void> => {
    await lastValueFrom(configService.loadErrorMessageList());
  };
}
//Synchronize Server Date
function setServerDateTime(configService: ConfigService) {
  return async (): Promise<void> => {

    await lastValueFrom(configService.setServerDateTime());
    const timer = setInterval(() => {
      if(GlobalConstants.serverDate) {
        GlobalConstants.serverDate.setSeconds(
          GlobalConstants.serverDate.getSeconds() + 1
        );
      }
    }, 1000);
  };
}

function signalRConnection (configService: ConfigService) {
  return async (): Promise<void> => {
    configService.buildSignalRConnection();
  };
}

function loadValidationMessage(configService: ConfigService) {
  return async (): Promise<void> => {
    await lastValueFrom(configService.loadValidationMessage());
  };
}

function loadFieldDetail(configService: ConfigService) {
  return async (): Promise<void> => {
    await lastValueFrom(configService.getFieldDetail(GlobalConstants.userInfo.languageCode));
  };
}



export const loadFieldTitle: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadFieldDetail,
  deps: [ConfigService],
  multi: true,
};

export const loadValidation: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadValidationMessage,
  deps: [ConfigService],
  multi: true,
};

export const loadErrorMessage: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: loadErrorMessageList,
  deps: [ConfigService],
  multi: true,
};

export const setServerDate: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: setServerDateTime,
  deps: [ConfigService],
  multi: true,
};

export const setSignalRConnection: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: signalRConnection,
  deps: [ConfigService],
  multi: true,
};