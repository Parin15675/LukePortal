import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from 'src/app/dashboard/services/category.service';

@Component({
  selector: 'app-permission-edit',
  templateUrl: './permission-edit.component.html',
  styleUrls: ['./permission-edit.component.scss']
})
export class PermissionEditComponent implements OnInit {
  isLoading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  dashboardList: any[] = [];
  userInfo: any;
  userPermission: any;
  pagination: any[] = [];
  selectedItems: { [key: string]: boolean } = {};
  selectedItemList: any[] = [];
  actionCheck: any;
  btnAction = 'Save';
  userId: any;
  constructor(private service: CategoryService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.userId =  params.get('id');
    });

    this.getDashboardList();
    this.getUserDetails();
  }

  getDashboardList() {
    const path = 'backoffice/dashboard/list/bu-cate/' + this.userId;
    const params = [
      { key: 'skip', value: (this.currentPage) },
      { key: 'limit', value: this.itemsPerPage },
      { key: 'search', value: '' },
      { key: 'bu', value: '' },
      { key: 'categoryId', value: '' }
    ];

    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.dashboardList = data.data.totalData;
      console.log('dashboardList', this.dashboardList);

      this.totalItems = data.data.totalCount;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching dashboardsList', error);
    });
  }
  handleAction(action: string) {
    if (action === 'Save') {
      this.onUpdate();
    }
    if (action === 'Cancel') {
      this.selectedItemList = [];
    }
  }
  updatePaginated() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagination = this.dashboardList.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginated();
      this.getDashboardList();
    }
  }

  getUserDetails() {
    const path = 'backoffice/user/detail/' + this.userId;
    const params = [
      { key: 'categoryId', value: 'all' }
    ];
  
    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.userInfo = data.data.userInfo;
      this.userPermission = data.data.permission;
      this.selectedItemList = this.userPermission;
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching', error);
    });
  }
  

  onCheckboxChange(item: any, event: any) {
    this.selectedItems[item.id] = event.checked;
    if (event.checked) {
      this.selectedItemList.push(item);
    } else {
      this.selectedItemList = this.selectedItemList.filter((i: any) => i.id !== item.id);
    }
    console.log(this.selectedItemList);
  }

  deleteSelectedItems(item: any) {
    this.selectedItemList = this.selectedItemList.filter((i: any) => i.id !== item.id);
    this.selectedItems[item.id] = false; // Uncheck the checkbox
  }
  onUpdate() {
    this.isLoading = true;
    const selectedIds = {
      permission: this.selectedItemList.map(item => ({
        id: item.id
      }))
    };
    console.log(selectedIds);

    const path = 'backoffice/user/permission';
    const observer = {
      next: (response: any) => {
        this.isLoading = false;
        this.selectedItemList = [];
        this.getDashboardList();
        this.getUserDetails();
      },
      error: (error: any) => {
        console.error('Error saving category', error);
        this.isLoading = false;
      }
    };
    this.service.put(`${path}/`+ this.userId, selectedIds).subscribe(observer);
  }
}
