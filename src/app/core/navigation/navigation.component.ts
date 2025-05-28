import { AfterViewInit, Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";
import { ConfigService } from 'src/app/app.config.service';
import { LastviewedService } from 'src/app/dashboard/services/lastviewed.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { SharedService } from 'src/app/shared/shared.service';
import { HttpHeaders } from '@angular/common/http';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { SlickAdminService } from '../services/slick-admin.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;
  @ViewChild(MatSidenavContainer) sidenavContainer!: MatSidenavContainer;
  title = 'Luke portal';
  isIframe = false;
  loginDisplay = false;
  isShowing = false;
  isExpanded = false;
  activeAccount: any;
  userInfo: any;
  userRole: any;
  private readonly _destroying$ = new Subject<void>();
  private jwtHelper = new JwtHelperService();
  isSubMenuOpen = false;
  headers: HttpHeaders;
  envName: string = '';
  version: string = '';

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private slickAdminService: SlickAdminService,
    private configService: ConfigService,
    private lastViewedService: LastviewedService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.configService.getSettings("luke").ocp_apim_subscription_key
    });
  }

  ngOnInit(): void {
    // Scroll to top on navigation events.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
    });
    // Uncomment the lines below when ready to use production settings.
    // this.envName = this.configService.getSettings("appInfo").environmentName;
    // this.version = this.configService.getSettings("appInfo").version;
    this.checkAccountFromSlickAdmin();
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  scrollToTop() {
    if (this.sidenavContainer) {
      this.sidenavContainer.scrollable.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleMenu() {
    this.trigger?.openMenu();
  }

  /**
   * Logs out the current user.
   * This method updates the shared auth status, preserves last viewed items,
   * clears local storage, and triggers the appropriate MSAL logout flow.
   */
  logout(): void {
    // Update shared authentication status to false.
    this.sharedService.updateAuthStatus(false);

    // Preserve "lastViewed" items before clearing local storage.
    let itemLastViewed = this.lastViewedService.getItems();
    localStorage.clear();
    localStorage.setItem('lastViewed', JSON.stringify(itemLastViewed));

    // Get the active account (or the first available account).
    const activeAccount = this.authService.instance.getActiveAccount() || this.authService.instance.getAllAccounts()[0];

    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup({
        account: activeAccount,
      }).subscribe({
        next: () => console.log('Logout via popup successful.'),
        error: (err) => console.error('Logout via popup error:', err)
      });
    } else {
      this.authService.logoutRedirect({
        account: activeAccount,
      }).subscribe({
        next: () => console.log('Logout via redirect successful.'),
        error: (err) => console.error('Logout via redirect error:', err)
      });
    }
  }

  /**
   * Checks the user account via SlickAdmin. On success, decodes and stores user profile,
   * then initiates further authorization. On a 401 error, triggers a logout.
   */
  async checkAccountFromSlickAdmin() {
    let jwt = localStorage.getItem('session');
    if (jwt) {
      this.slickAdminService.getUserInfo(
        this.configService.getSettings("slickAdmin").url,
        jwt,
        this.configService.getSettings('slickAdmin').token
      ).subscribe(
        res => {
          this.userInfo = this.jwtHelper.decodeToken(res.token);
          console.log(this.userInfo);
          localStorage.setItem('profile', JSON.stringify(this.userInfo));
          this.getAuthForAdmininApp();
        },
        err => {
          console.log(err);
          if (err.status === 401) {
            this.logout();
          } else {
            console.error(err);
            this.logout();
          }
        },
        () => console.log('HTTP request completed.')
      );
    }
  }

  /**
   * Authenticates the admin in the app using the SharedService.
   * On success, updates the shared auth status.
   * On failure, logs out and updates the auth status.
   */
  getAuthForAdmininApp() {
    const uname = JSON.parse(localStorage.getItem('profile')!);
    const data = {
      email: uname.payload.user.uname
    };
    const observer = {
      next: (response: any) => {
        console.log('Login successful', response);
        this.userRole = response.data.role;
        localStorage.setItem('appToken', response.data.accessToken);
        this.sharedService.updateAuthStatus(true); // Update the auth status here.
      },
      error: (error: any) => {
        console.error('Login failed', error);
        this.logout();
        this.sharedService.updateAuthStatus(false); // Update the auth status on error.
      }
    };
    this.sharedService.getAuth(data).subscribe(observer);
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
