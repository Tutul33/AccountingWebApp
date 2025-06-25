import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheContent {
  value: any;
}

@Injectable({
  providedIn: 'root',
})
export class DataCacheService {
  private formData: any;
  private cache: Map<string, CacheContent> = new Map<string, CacheContent>();
  private inFlightObservables: Map<string, Subject<any>> = new Map<
    string,
    Subject<any>
  >();

  constructor() { }

  get(key: string, fallback?: any): Observable<any> | Subject<any> {
    let ddd = this.hasValidCachedValue(key);
    if (this.hasValidCachedValue(key)) {
      return of(this.cache.get(key).value);
    }
    let fff = this.inFlightObservables.has(key);
    if (this.inFlightObservables.has(key)) {
      return this.inFlightObservables.get(key);
    } else if (fallback && fallback instanceof Observable) {
      this.inFlightObservables.set(key, new Subject());
      return fallback.pipe(
        tap((value) => {
          this.set(key, value);
        })
      );
    }
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  private notifyInFlightObservers(key: string, value: any): void {
    if (this.inFlightObservables.has(key)) {
      const inFlight = this.inFlightObservables.get(key);
      const observersCount = inFlight.observers.length;
      if (observersCount) {
        inFlight.next(value);
      }
      inFlight.complete();
      this.inFlightObservables.delete(key);
    }
  }

  set(key: string, value: any): void {
    this.cache.set(key, { value: value });
    this.notifyInFlightObservers(key, value);
  }

  private hasValidCachedValue(key: string): boolean {
    if (this.cache.has(key)) {
      return true;
    } else {
      return false;
    }
  }

  public setFormData(formData: any): void {
    this.formData = formData;
  }

  public getFormData(): any {
    return this.formData;
  }
}
