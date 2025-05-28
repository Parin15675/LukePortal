import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ConfigService } from 'src/app/app.config.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private headers: HttpHeaders = new HttpHeaders(); // Initialize as an empty HttpHeaders object

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.updateHeaders();
  }

  private updateHeaders(): void {
    const accessToken = localStorage.getItem('appToken');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': this.configService.getSettings("luke").ocp_apim_subscription_key
    });
  }

  private getHeaders(): HttpHeaders {
    this.updateHeaders();
    return this.headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = Array.isArray(error.error.message) ? error.error.message.toString() : error.error.message;
    console.error('Service::Error', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getAll(path: string): Observable<any> {
    return this.http
      .get<any>(this.configService.getSettings("luke").apiUrl + path, { headers: this.getHeaders() })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  getDataWithParams(path: string, queryParams: any): Observable<any> {
    let params = new HttpParams();
    for (const param of queryParams) {
      params = params.set(param.key, param.value);
    }

    return this.http
      .get<any>(this.configService.getSettings("luke").apiUrl + path, { headers: this.getHeaders(), params })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  getById(path: string, id: string): Observable<any> {
    const url = `${this.configService.getSettings("luke").apiUrl}${path}/${id}`;
    return this.http
      .get<any>(url, { headers: this.getHeaders() })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  post(path: string, data: any): Observable<any> {
    const url = this.configService.getSettings("luke").apiUrl + path;
    return this.http
      .post<any>(url, data, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  put(path: string, data: any): Observable<any> {
    const url = this.configService.getSettings("luke").apiUrl + path;
    return this.http
      .put<any>(url, data, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
}
