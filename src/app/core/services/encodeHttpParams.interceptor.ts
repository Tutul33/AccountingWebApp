import { HttpRequest, HttpEvent, HttpParams, HttpParameterCodec, HttpHandlerFn, HttpInterceptorFn } from "@angular/common/http";
import { Observable } from "rxjs";
 
// @Injectable()
// export class EncodeHttpParamsInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const params = new HttpParams({encoder: new CustomEncoder(), fromString: req.params.toString()});
//     return next.handle(req.clone({params}));
//   }
// }
export const EncodeHttpParamsInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const params = new HttpParams({ encoder: new CustomEncoder(), fromString: req.params.toString() });
  const modifiedRequest = req.clone({ params });

  return next(modifiedRequest);
};
 
class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
 
  encodeValue(value: string): string {    
    return encodeURIComponent(value);
  }
 
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
 
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}