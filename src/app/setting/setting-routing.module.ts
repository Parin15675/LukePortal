import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from '../core/navigation/navigation.component';
import { CategoryComponent } from './pages/category/category.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BuManagementComponent } from './pages/bu-management/bu-management.component';
import { PermissionCloneComponent } from './pages/permission-clone/permission-clone.component';
import { PermissionEditComponent } from './pages/permission-edit/permission-edit.component';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: '',
        component: CategoryComponent, data: { breadcrumb: 'Home' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'category',
        component: CategoryComponent, data: { breadcrumb: 'category' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'dashboard',
        component: DashboardComponent, data: { breadcrumb: 'dashboard' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'business-unit',
        component: BuManagementComponent, data: { breadcrumb: 'business-unit' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'permission-edit/:id',
        component: PermissionEditComponent, data: { breadcrumb: 'permission-edit' },
        canActivate: [
          MsalGuard
        ]
      },
      {
        path: 'permission-clone/:id',
        component: PermissionCloneComponent, data: { breadcrumb: 'permission-clone' },
        canActivate: [
          MsalGuard
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
