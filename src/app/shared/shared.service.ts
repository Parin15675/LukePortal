import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../app.config.service';
import { catchError, Observable, retry, throwError, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private headers: HttpHeaders;
  private authCompleteSubject = new BehaviorSubject<boolean>(false);
  public authComplete$ = this.authCompleteSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.configService.getSettings("luke").ocp_apim_subscription_key
    });
  }

  getAuth(user: any): Observable<any> {
    const path = 'auth/login';
    const url = this.configService.getSettings("luke").apiUrl + path;
    const headers = this.headers;
    return this.http.post(url, user, { headers })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  // Handle API errors
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error('service::error ', error.error);
    }
    let errorMessage = '';
    if (Array.isArray(error.error.message)) {
      errorMessage = error.error.message.toString();
    } else {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(`${errorMessage}`));
  }

  // Public method to update the authentication status
  public updateAuthStatus(status: boolean) {
    this.authCompleteSubject.next(status);
  }
}
