import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { Observable, catchError, retry, throwError } from 'rxjs';

export interface UserLocResponse {
  token: string;
}
@Injectable({
  providedIn: 'root'
})

export class SlickAdminService {

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private httpClient: HttpClient,
    private authService: MsalService

  ) { }
  getUserInfo(endpoint: string, auth_token: string, token: string): Observable<UserLocResponse> {

    let params = new HttpParams()
    params = params.append('exclude', '2001,3101,3102,3201,3202,3301,3302,3400,4000')
    // params = params.append('null', 'false')

    let headers = new HttpHeaders()
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Content-Type', 'Access-Control-Allow-Headers');
    headers = headers.append("ocp-apim-subscription-key", token)
    headers = headers.append("app", "luke-portal")
    headers = headers.append('authorization', `Bearer ${auth_token}`)

    return this.httpClient.get<UserLocResponse>(endpoint, {
      headers: headers,
      params: params
    })

  }


}
