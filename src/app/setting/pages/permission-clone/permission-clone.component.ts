import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from 'src/app/dashboard/services/category.service';

@Component({
  selector: 'app-permission-clone',
  templateUrl: './permission-clone.component.html',
  styleUrls: ['./permission-clone.component.scss']
})
export class PermissionCloneComponent implements OnInit {
  isLoading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  usersList: any[] = [];
  userInfo: any;
  userPermission: any;
  pagination: any[] = [];
  selectedItems: { [key: string]: boolean } = {};
  selectedItemList: any[] = [];
  actionCheck: any;
  btnAction = 'Save';
  userId: any;
  emailSearch: any;
  hasSearched: boolean = false;

  constructor(private service: CategoryService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.userId =  params.get('id');
    });
    this.getUsersList();
    this.getUserDetails();
  }

  getUsersList() {
    const path = 'backoffice/user/without-id';
    const params = [
      { key: 'id', value: this.userId },
      { key: 'skip', value: (this.currentPage) },
      { key: 'limit', value: this.itemsPerPage },
      { key: 'search', value: this.emailSearch ? this.emailSearch : '' },
      { key: 'bu', value: 'all' },
    ];

    this.isLoading = true;
    this.service.getDataWithParams(path, params).subscribe((data) => {
      this.isLoading = false;
      this.usersList = data.data.totalData;
      console.log('usersList', this.usersList);

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
      this.uncheckAll();
    }
    if (action === 'search' && this.emailSearch) {
      this.getUsersList();
      this.hasSearched = true; 
    }
  }
  updatePaginated() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagination = this.usersList.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginated();
      this.getUsersList();
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
      console.log(this.userPermission);
      
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
      user: this.selectedItemList.map(item => ({
        id: item.id
      })),
      permission: this.userPermission.map((item :any) => ({
        id: item.id
      }))
    };
    console.log('selectedIds', selectedIds);

    const path = 'backoffice/user/multi/permission';
    const observer = {
      next: (response: any) => {
        this.isLoading = false;
        this.selectedItemList = [];
        this.getUsersList();
        this.getUserDetails();
        this.uncheckAll();
      },
      error: (error: any) => {
        console.error('Error saving category', error);
        this.isLoading = false;
      }
    };
    this.service.put(`${path}`, selectedIds).subscribe(observer);
  }
  uncheckAll() {
    // Set the selected status of all items to false
    this.usersList.forEach(item => item.selected = false);
  
    // Clear the selected items lists
    this.selectedItems = {};
    this.selectedItemList = [];
  
    console.log('All items have been unchecked');
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
}
