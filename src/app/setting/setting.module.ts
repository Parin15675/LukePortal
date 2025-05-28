import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { CategoryComponent } from './pages/category/category.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrimaryBtnComponent } from './components/primary-btn/primary-btn.component';
import { SecondaryBtnComponent } from './components/secondary-btn/secondary-btn.component';
import { BuManagementComponent } from './pages/bu-management/bu-management.component';
import { MaterialModule } from '../shared/material.module';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupBuComponent } from './components/popup-bu/popup-bu.component';
import { PermissionEditComponent } from './pages/permission-edit/permission-edit.component';
import { PermissionCloneComponent } from './pages/permission-clone/permission-clone.component';


@NgModule({
  declarations: [
    CategoryComponent,
    DashboardComponent,
    PrimaryBtnComponent,
    SecondaryBtnComponent,
    BuManagementComponent,
    InputFieldComponent,
    SlideToggleComponent,
    PopupBuComponent,
    PermissionEditComponent,
    PermissionCloneComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  exports: [
    PrimaryBtnComponent,
  ]
})
export class SettingModule { }
