import { Component, ElementRef, OnInit, ViewChild, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import * as pbi from 'powerbi-client';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss']
})
export class DashboardDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('reportContainer', { static: false }) reportContainer?: ElementRef;

  reportData: any;
  paramItems: any;
  groupPermission: string = '';
  inactivityTimeout: any;
  private unsubscribe$ = new Subject<void>();

  powerbi = new pbi.service.Service(
    pbi.factories.hpmFactory,
    pbi.factories.wpmpFactory,
    pbi.factories.routerFactory
  );

  constructor(
    private service: CategoryService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getUserGroupPermission();
    this.subscribeToRouterEvents();
    this.getParams();
    this.startInactivityTimer();
  }

  ngAfterViewInit(): void {
    this.setupActivityListeners();
  }

  ngOnDestroy(): void {
    clearTimeout(this.inactivityTimeout);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.unloadPowerBI();
    console.log('Cleaned up listeners and timers.');
  }

  private getUserGroupPermission() {
    const userProfile = localStorage.getItem('profile');
    if (userProfile) {
      const uname = JSON.parse(userProfile);
      this.groupPermission = uname.payload.group[0]?.code || '';
    }
  }

  private subscribeToRouterEvents() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntil(this.unsubscribe$))
      .subscribe(() => window.scrollTo(0, 0));
  }

  private setupActivityListeners() {
    const resetInactivityTimer = () => this.resetInactivityTimer();

    // Attach event listeners within the report container
    if (this.reportContainer?.nativeElement) {
      this.renderer.listen(this.reportContainer.nativeElement, 'mousemove', resetInactivityTimer);
      this.renderer.listen(this.reportContainer.nativeElement, 'mouseenter', resetInactivityTimer);
    }

    // Add global listeners to handle iframe interactions
    ['mousemove', 'mousedown', 'keydown', 'scroll'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.unloadPowerBI();
      }
    });
  }

  private startInactivityTimer() {
    this.resetInactivityTimer(); // Initialize the timer
  }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.unloadPowerBI();
      this.navigateBack();
    }, 300000); // 5 minutes
    console.log('Inactivity timer reset.');
  }

  private unloadPowerBI() {
    if (this.reportContainer?.nativeElement) {
      const instance = this.powerbi.find(this.reportContainer.nativeElement);
      if (instance) {
        this.powerbi.reset(this.reportContainer.nativeElement);
        console.log('Power BI report successfully unloaded.');
      } else {
        console.warn('Power BI instance not found. Skipping unload.');
      }
    } else {
      console.warn('Report container not available.');
    }
  }
  

  private getParams() {
    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      this.paramItems = params;
      this.getReport();
    });
  }

  private getReport() {
    const path = 'bi/getEmbedToken';
    const params = [
      { key: 'workspaceId', value: this.paramItems?.params.workspaceId },
      { key: 'reportId', value: this.paramItems?.params.reportId },
      { key: 'permissionGroup', value: this.groupPermission }
    ];

    this.service.getDataWithParams(path, params).pipe(takeUntil(this.unsubscribe$)).subscribe(
      data => {
        this.reportData = data;
        const config: pbi.IEmbedConfiguration = {
          type: 'report',
          id: this.reportData.embedUrl[0]?.reportId,
          embedUrl: this.reportData.embedUrl[0]?.embedUrl,
          accessToken: this.reportData.accessToken,
          tokenType: pbi.models.TokenType.Aad,
          permissions: pbi.models.Permissions.Read,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: true
          }
        };

        const container = this.reportContainer?.nativeElement;
        if (container) {
          const report = this.powerbi.embed(container, config) as pbi.Report;

          // Attach event listeners for iframe interactions
          this.attachReportEventListeners(report);
          console.log('Power BI report embedded successfully.');
        }
      },
      error => {
        console.error('Failed to load Power BI report:', error);
      }
    );
  }

  // Attach event listeners to detect user interactions within the Power BI report
  private attachReportEventListeners(report: pbi.Report) {
    const resetInactivityTimer = () => this.resetInactivityTimer();

    report.on('loaded', () => {
      console.log('Report loaded.');
      resetInactivityTimer();
    });

    report.on('rendered', () => {
      console.log('Report rendered.');
      resetInactivityTimer();
    });

    report.on('dataSelected', (event) => {
      console.log('User selected data:', event);
      resetInactivityTimer();
    });

    report.on('pageChanged', (event) => {
      console.log('User changed page:', event);
      resetInactivityTimer();
    });

    report.on('buttonClicked', (event) => {
      console.log('Button clicked:', event);
      resetInactivityTimer();
    });

    report.on('error', (event) => {
      console.error('Power BI error:', event);
    });
  }

  private navigateBack() {
    this.router.navigate(['/']); // Adjust based on your routing setup
  }

  backClicked() {
    this.unloadPowerBI();
    this.navigateBack();
  }
}
