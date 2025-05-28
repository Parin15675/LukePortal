import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { SharedService } from 'src/app/shared/shared.service';
import { MsalService } from '@azure/msal-angular';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
  category: any;
  dashboardList: any;
  itemLastViewed: any;
  listMenu: any;
  authComplete: boolean = false;
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private sharedService: SharedService,
    private authService: MsalService,
  ) { }

  ngOnInit(): void {

    this.sharedService.authComplete$
    .pipe(
      filter(authComplete => authComplete), // only pass through true values
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.authComplete = true;
      this.getDashboards();
    });
  
  }

  navigateToDetail(item: any) {
    const queryParams = {
      workspaceId: item.workspaceId,
      reportId: item.reportId,
    };
    this.router.navigate(['/report'], { queryParams: queryParams });
    document.getElementsByTagName('mat-drawer-content')[0].scrollTo(0, 0);
  }

  getDashboards(): void {
    const path = 'auth/menu';
    this.isLoading = true;
    this.categoryService.getAll(path).subscribe({
      next: (response: any) => {
        this.listMenu = response.data.listMenu;
        console.log('Dashboard data:', this.listMenu);
        this.isLoading = false;

      },
      error: (error: any) => {
        // Handle errors
        // this.errorMessage = 'Failed to load dashboards. Please try again later.';
        this.logout();
        console.error('Error fetching dashboards:', error);

      },
      complete: () => {
        this.isLoading = false;
        console.log('Dashboard data fetch completed.');
      }
    });
  }
  logout(): void {
    // Clear local storage
    localStorage.clear();
    // Trigger MSAL logout via redirect
    this.authService.logoutRedirect().subscribe({
      next: () => console.log('Logout successful'),
      error: (err) => console.error('Logout error:', err)
    });
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Section not found:', sectionId);
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
