import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MaterialModule } from '../shared/material.module';
import { CategoryComponent } from './pages/category/category.component';
import { BannerComponent } from './components/banner/banner.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardListComponent } from './pages/dashboard-list/dashboard-list.component';
import { DashboardDetailComponent } from './pages/dashboard-detail/dashboard-detail.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';


@NgModule({
  declarations: [
    CategoryComponent,
    BannerComponent,
    DashboardListComponent,
    DashboardDetailComponent,
    // BreadcrumbComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    NgbModule,
    PowerBIEmbedModule
  ],
})
export class DashboardModule { }
