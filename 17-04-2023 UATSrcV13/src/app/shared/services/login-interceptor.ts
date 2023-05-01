import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpResponse,
} from "@angular/common/http";
import { finalize } from "rxjs/operators";
import { LoadingService } from "./loading.service";
// import { AppLoaderComponent } from '../loader/Loader-full';
import { of } from "rxjs";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {

    if (request && request.body && request.body.stopLoader) {
    } else {
      if (request.headers.has('hideLoader')) {
        this.loadingService.setLoading(false);
        const headers = request.headers.delete('hideLoader');
        request = request.clone({ headers });
      }
      else {
        this.totalRequests++;
        this.loadingService.setLoading(true);
      }
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (request && request.body && request.body.stopLoader) {
        } else {
          this.totalRequests--;
          if (this.totalRequests === 0) {
            this.loadingService.setLoading(false);
          }
        }
      })
    );
  }
}
