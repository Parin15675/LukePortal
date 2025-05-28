import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from '../core/navigation/navigation.component';
import { CategoryComponent } from './pages/category/category.component';
import { DashboardListComponent } from './pages/dashboard-list/dashboard-list.component';
import { DashboardDetailComponent } from './pages/dashboard-detail/dashboard-detail.component';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: '',
        component: DashboardListComponent, data: { breadcrumb: 'Home' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'dashboard-list',
        component: DashboardListComponent, data: { breadcrumb: 'dashboard-list' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'report',
        component: DashboardDetailComponent, data: { breadcrumb: 'report' },
        canActivate: [
          MsalGuard
        ]
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes,)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
