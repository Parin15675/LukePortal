import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from 'src/app/dashboard/services/category.service';
import { PopupBuComponent } from '../../components/popup-bu/popup-bu.component';

@Component({
  selector: 'app-bu-management',
  templateUrl: './bu-management.component.html',
  styleUrls: ['./bu-management.component.scss']
})
export class BuManagementComponent implements OnInit {
  fForm: FormGroup;
  usersList: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedCategories: any[] = [];
  actionTitle = 'Add user';
  btnAction = 'Create';
  userId: any;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  buOptions = ['CDS', 'CMG', 'SSP', 'CFR', 'Global', 'Support', 'BA'];
  roleOptions = ['ADMIN', 'USER'];
  userDetails: any;
  userPermission: any;
  initialFormData: any;
  emailSearch: any;
  hasSearched: boolean = false;

  readonly dialog = inject(MatDialog);

  constructor(private service: CategoryService, private fb: FormBuilder) {
    this.fForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      bu: ['', Validators.required],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    this.getUsersList();
  }

  getUsersList() {
    const path = 'backoffice/user/list';
    const params = [
      { key: 'skip', value: this.currentPage },
      { key: 'limit', value: this.itemsPerPage },
      { key: 'search', value: this.emailSearch ? this.emailSearch : '' },
      { key: 'bu', value: 'all' }
    ];
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.usersList = data.data.totalData;
      this.totalItems = data.data.totalCount;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching categories', error);
    });
  }

  handleAction(action: string) {
    if (action === 'Update' || action === 'Create') {
      this.onSubmit();
    }
    if (action === 'Cancel') {
      this.resetForm();
    }
    if (action === 'Manage') {
      this.openDialog();
    }
    if (action === 'search' && this.emailSearch) {
      this.getUsersList();
      this.hasSearched = true; 
    }
  }
  clearSearch(): void {
    if (this.hasSearched) {
      this.emailSearch = '';
      this.getUsersList(); 
      this.hasSearched = false; 
    } else {
      this.emailSearch = ''; 
    }
  }
  updatePaginated() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCategories = this.usersList.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getUsersList();
    }
  }

  onSubmit() {
    if (this.fForm.invalid) {
      this.fForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = { ...this.fForm.value }; // Create a copy of form data
    const path = 'backoffice/user';
    const observer = {
      next: (response: any) => {
        this.isLoading = false;
        this.resetForm();
        this.getUsersList();
      },
      error: (error: any) => {
        console.error('Error saving user', error);
        this.isLoading = false;
      }
    };

    if (this.isEditMode) {
      // Remove unchanged fields
      if (!this.isFieldEdited('email')) delete formData.email;
      if (!this.isFieldEdited('name')) delete formData.name;
      if (!this.isFieldEdited('lastName')) delete formData.lastName;
      if (!this.isFieldEdited('role')) delete formData.role;
      if (!this.isFieldEdited('bu')) delete formData.bu;
      if (!this.isFieldEdited('isActive')) delete formData.isActive;

      this.service.put(`${path}/${this.userId}`, formData).subscribe(observer);
    } else {
      this.service.post(path, formData).subscribe(observer);
    }
  }

  isFieldEdited(field: string): boolean {
    return this.initialFormData[field] !== this.fForm.value[field];
  }

  editUser(user: any) {
    this.actionTitle = 'Edit User';
    this.btnAction = 'Update';
    this.userId = user.id;
    this.isEditMode = true;
    this.getUserDetails(this.userId);
  }

  getUserDetails(dashboard: any) {
    const path = 'backoffice/user/detail/' + this.userId;
    this.isLoading = true;
    const params = [
      { key: 'categoryId', value: 'all' },
    ];
    this.service.getDataWithParams(path, params).subscribe({
      next: (data) => {
        this.userDetails = data.data.userInfo;
        this.userPermission = data.data.permission
        console.log('data', data);
        this.patchForm(this.userDetails);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching dashboard details', error);

      }
    });
  }

  patchForm(data: any) {
    this.fForm.patchValue({
      email: data.email,
      name: data.name,
      lastName: data.lastName,
      role: data.role,
      bu: data.bu,
      isActive: data.isActive
    });
    this.initialFormData = this.fForm.value;
  }

  resetForm() {
    this.actionTitle = 'Add user';
    this.btnAction = 'Create';
    this.fForm.reset();
    this.isEditMode = false;
    this.initialFormData = null;
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(PopupBuComponent, {
      data: {
        userId: this.userDetails.id
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        // this.animal.set(result);
      }
    });
  }

}
