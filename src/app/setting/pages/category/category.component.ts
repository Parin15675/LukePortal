import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/dashboard/services/category.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categoryForm: FormGroup;
  toggleOpen: boolean = false;
  categories: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedCategories: any[] = [];
  actionTitle = 'Create Category';
  btnAction = 'Create';
  categoryId: any;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  originalData: any = {};
  activityId: any;
  activities: any[] = [];
  activityCurrentPage: number = 1;
  activityItemsPerPage: number = 10;
  activityTotalItems: number = 0;
  activityTotalPages: number = 0;
  paginatedActivities: any[] = [];
  authComplete: boolean = false;
  constructor(private service: CategoryService, private fb: FormBuilder,
    private sharedService: SharedService
  ) {
    this.categoryForm = this.fb.group({
      nameTh: ['', Validators.required],
      nameEn: ['', Validators.required],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    this.sharedService.authComplete$.subscribe(authComplete => {
      console.log('authComplete', authComplete);
      if (authComplete) {
        this.authComplete = true;
        this.getCategoryList();
        this.getActivityList();

      }
    })
  }

  functioncall(event: any) {
    console.log('event', event);
    
    if (event === 'Create' || event === 'Update') {
      this.onSubmit();
    } else if (event === 'cancel') {
      this.resetForm();
    }
  }

  getCategoryList() {
    const path = 'backoffice/category/list';
    const params = [
      { key: 'skip', value: (this.currentPage) },
      { key: 'limit', value: this.itemsPerPage }
    ];
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.categories = data.data.totalData;
      this.totalItems = data.data.totalCount;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePaginatedCategories();
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching categories', error);
    });
  }

  updatePaginatedCategories() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCategories();
    }
    this.getCategoryList();
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = { ...this.categoryForm.value }; // Create a copy of form data
    console.log('formData', formData);

    const path = 'backoffice/category';
    const observer = {
      next: (response: any) => {
        this.isLoading = false;
        this.getCategoryList();
      },
      error: (error: any) => {
        console.error('Error saving category', error);
        this.isLoading = false;
      }
    };

    if (this.isEditMode) {
      if (!this.isFieldEdited('nameTh')) delete formData.nameTh;
      if (!this.isFieldEdited('nameEn')) delete formData.nameEn;
      if (!this.isFieldEdited('isActive')) delete formData.isActive;

      this.service.put(`${path}/${this.categoryId}`, formData).subscribe(observer);
    } else {
      this.service.post(path, formData).subscribe(observer);
    }
  }

  isFieldEdited(fieldName: string): boolean {
    const originalValue = this.originalData[fieldName];
    console.log('originalValue', originalValue);

    const currentValue = this.categoryForm.get(fieldName)?.value;
    return originalValue !== currentValue;
  }


  editCategory(category: any) {
    this.actionTitle = 'Edit Category';
    this.btnAction = 'Update';
    this.categoryId = category.id;
    this.toggleOpen = true;
    this.isEditMode = true;
    this.categoryForm.patchValue({
      nameEn: category.nameEn,
      nameTh: category.nameTh,
      isActive: category.isActive
    });
    this.originalData = { ...category };
  }

  resetForm() {
    this.actionTitle = 'Create Category';
    this.btnAction = 'Create';
    this.categoryForm.reset();
    this.isEditMode = false;
    this.categoryId = null;
  }

  getActivityList() {
    const path = 'backoffice/activity/list';
    const params = [
      { key: 'skip', value: this.activityCurrentPage.toString() },
      { key: 'limit', value: this.activityItemsPerPage.toString() },
      { key: 'service', value: 'CATEGORY' }
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




