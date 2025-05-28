import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IdTokenClaims } from '@azure/msal-common';
import { AuthenticationResult, EventMessage, EventType, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { Router } from '@angular/router';


type IdTokenClaimsWithPolicyId = IdTokenClaims & {
  acr?: string;
  tfp?: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    // Ensure an active account is set if available
    this.checkAndSetActiveAccount();
    this.setLoginDisplay();

    // Enable cross-tab account events (optional)
    this.authService.instance.enableAccountStorageEvents();

    // Subscribe to MSAL events
    this.msalBroadcastService.msalSubject$
      .pipe(takeUntil(this._destroying$))
      .subscribe((result: EventMessage) => {
        console.log('MSAL Event:', result.eventType, result.payload);

        if (result.eventType === EventType.LOGIN_SUCCESS) {
          const payload = result.payload as AuthenticationResult;
          // Optionally store token for session tracking (consider security implications)
          localStorage.setItem('session', payload.idToken);
          // Set active account after successful login
          this.authService.instance.setActiveAccount(payload.account);
          this.setLoginDisplay();
        } else if (result.eventType === EventType.LOGIN_FAILURE) {
            this.authService.logoutRedirect().subscribe({
                error: (err) => console.error('Logout error:', err)
              });
          localStorage.removeItem('session');
        } else if (result.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
          console.error('Token acquisition failed:', result.payload);
          // Clear stale tokens and force re-login
          localStorage.removeItem('session');
          this.authService.logoutRedirect().subscribe({
            error: (err) => console.error('Logout error:', err)
          });
        }
      });
  }

  /**
   * Update the login display flag based on available accounts.
   */
  setLoginDisplay(): void {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  /**
   * If no active account is set but accounts exist, set the first account as active.
   */
  checkAndSetActiveAccount(): void {
    const activeAccount = this.authService.instance.getActiveAccount();
    const allAccounts = this.authService.instance.getAllAccounts();
    if (!activeAccount && allAccounts.length > 0) {
      this.authService.instance.setActiveAccount(allAccounts[0]);
    }
  }

  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    console.log('userFlowRequest', userFlowRequest);

    if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
    } else {
        this.authService.loginRedirect(userFlowRequest);
    }
}

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
