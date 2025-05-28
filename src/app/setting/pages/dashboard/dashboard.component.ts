import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/dashboard/services/category.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  fForm: FormGroup;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pagination: any[] = [];
  actionTitle = 'Create Dashboard';
  btnAction = 'Create';
  dashboardId: any;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  categoriesList: any = [];
  dashboardsList: any = [];
  buOptions = ['CDS', 'CMG', 'SSP', 'CFR', 'Global', 'Support', 'BA'];
  url: any;
  image: any;
  dashboardDetails: any;
  originalData: any = {}; // Store original data for comparison
  toggleOpen: boolean = false;
  activityId: any;
  activities: any[] = [];
  activityCurrentPage: number = 1;
  activityItemsPerPage: number = 10;
  activityTotalItems: number = 0;
  activityTotalPages: number = 0;
  paginatedActivities: any[] = [];



  constructor(private service: CategoryService, private fb: FormBuilder) {
    this.fForm = this.fb.group({
      nameTh: ['', Validators.required],
      nameEn: ['', Validators.required],
      workspaceId: ['', Validators.required],
      reportId: ['', Validators.required],
      categoryId: ['', Validators.required],
      bu: ['', Validators.required],
      isActive: [false],
    });
  }

  ngOnInit(): void {
    this.getDashboardList();
    this.getCategoryList();
    this.getActivityList();
  }

  handleAction(action: string) {
    if (action === 'Update' || action === 'Create') {
      this.onSubmit();
    }
    if (action === 'Cancel') {
      this.resetForm();
    }
  }

  getDashboardList() {
    const path = 'backoffice/dashboard/list';
    const params = [
      { key: 'skip', value: this.currentPage },
      { key: 'limit', value: this.itemsPerPage }
    ];
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe(
      (data) => {
        this.isLoading = false;
        this.dashboardsList = data.data.totalData;
        this.totalItems = data.data.totalCount;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginated();
        console.log(this.dashboardsList);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching dashboardsList', error);
      }
    );
  }

  updatePaginated() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagination = this.dashboardsList.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginated();
      this.getDashboardList();
    }
  }

  editDashboard(dashboard: any) {
    this.isEditMode = true;
    this.btnAction = 'Update';
    this.getDashboardDetails(dashboard);
    this.dashboardId = dashboard.id;
    this.toggleOpen = true;

  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.image = event.target.files[0];
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event) => {
        this.url = event.target?.result;
      };
    }
  }

  onSubmit() {
    if (this.fForm.invalid) {
      this.fForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    if (this.image) {
      formData.append('icon', this.image);
    }

    const fieldsToCheck = [
      'nameTh',
      'nameEn',
      'isActive',
      'categoryId',
      'workspaceId',
      'reportId',
      'bu'
    ];

    fieldsToCheck.forEach(field => {
      if (this.isFieldEdited(field)) {
        formData.append(field, this.fForm.get(field)?.value);
      }
    });

    const path = 'backoffice/dashboard';
    const request$ = this.isEditMode
      ? this.service.put(`${path}/${this.dashboardId}`, formData)
      : this.service.post(path, formData);

    request$.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.getDashboardList();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving dashboard', error);
        this.isLoading = false;
      }
    });
  }

  isFieldEdited(fieldName: string): boolean {
    const originalValue = this.originalData[fieldName];
    const currentValue = this.fForm.get(fieldName)?.value;
    return originalValue !== currentValue;
  }

  patchForm(dashboard: any) {
    this.originalData = { ...dashboard }; // Store original data for comparison

    this.fForm.patchValue({
      nameTh: dashboard.nameTh,
      nameEn: dashboard.nameEn,
      isActive: dashboard.isActive,
      categoryId: dashboard.categoryId,
      workspaceId: dashboard.workspaceId,
      reportId: dashboard.reportId,
      bu: dashboard.bu
    });

    this.url = dashboard.iconUrl;
  }

  getCategoryList() {
    const path = 'backoffice/category/list';
    const params = [
      { key: 'skip', value: 0 },
      { key: 'limit', value: 100 }
    ];
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.categoriesList = data.data.totalData;
      console.log('data', data);
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching categories', error);
    });
  }

  resetForm() {
    this.actionTitle = 'Create Category';
    this.btnAction = 'Create';
    this.fForm.reset();
    this.url = '';
    this.isEditMode = false;
    this.originalData = {}; // Reset original data
  }

  getDashboardDetails(dashboard: any) {
    const path = 'backoffice/dashboard/detail/';
    this.isLoading = true;
    this.service.getById(path, dashboard.id).subscribe({
      next: (data) => {
        this.dashboardDetails = data.data;
        this.dashboardId = dashboard.id;
        this.patchForm(this.dashboardDetails);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching dashboard details', error);
      }
    });
  }

  getActivityList() {
    const path = 'backoffice/activity/list';
    const params = [
      { key: 'skip', value: this.activityCurrentPage.toString() },
      { key: 'limit', value: this.activityItemsPerPage.toString() },
      { key: 'service', value: 'DASHBOARD'}
    ];
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe({
      next: (data) => {
        this.isLoading = false;
        console.log('API response:', data);
        this.activities = data.data.totalData;
        this.activityTotalItems = data.data.totalCount;
        this.activityTotalPages = Math.ceil(this.activityTotalItems / this.activityItemsPerPage);
        this.updatePaginatedActivitiesList();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching Activities', error);
      }
    });
  }
  
  updatePaginatedActivitiesList() {
    const start = (this.activityCurrentPage - 1) * this.activityItemsPerPage;
    const end = start + this.activityItemsPerPage;
    this.paginatedActivities = this.activities.slice(start, end);
  }
  
  changeActivityPage(page: number) {
    if (page >= 1 && page <= this.activityTotalPages) {
      this.activityCurrentPage = page;
      this.getActivityList();
    }

  }
}
