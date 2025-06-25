import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  
  protected _eventsSubject = new BehaviorSubject<any[]>([{key: 'userInfo', value: 0}]);
  constructor() {}

  broadcast(key: any, value: any) {
    let hasMatch: boolean = false;
    this._eventsSubject.next(this._eventsSubject.value.map((obj: any) => { if(obj.key === key) { hasMatch = true; return { key, value } }else{return obj}}));

    if(!hasMatch)
      this._eventsSubject.next(this._eventsSubject.getValue().concat([{ key, value }]));
  }

  on<T>(key: any): Observable<T> {
    return this._eventsSubject.pipe(           
          map((e: any) => e.find((x: any ) => x.key === key)?.value)
    );
  }

  remove(key?: any) {
    const roomObj: any[] = this._eventsSubject.getValue();
  
    if(key) {
      roomObj.forEach((item, index) => {
        if (item.key === key) { roomObj.splice(index, 1); } 
      });
    } else {
      roomObj.length = 1;
    }

    
  
    this._eventsSubject.next(roomObj);
  }

  unsubscribe(eventsSubject$: any)  {
    eventsSubject$.next();
    eventsSubject$.complete();
  }
}

/*import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  protected _eventsSubject = new BehaviorSubject<any>({key: 'userInfo', value: 0});
  private observer = new BehaviorSubject([]);
  subscriber = this.observer.asObservable();

  emitData(data) {
    this.observer.next(data);
  }

  constructor() {}

  broadcast(key: any, value: any) {
    this._eventsSubject.next({ key, value }); // here we are setting the key and value of our subject
  }

  on<T>(key: any): Observable<T> {
    return this._eventsSubject.asObservable().pipe(
      filter((e: any) => {
        if (e) {
          return e.key === key;
        }
      }),
      map((e: any) => e.value || null)
    );
  }
}*/

