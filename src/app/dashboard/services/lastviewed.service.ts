import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LastviewedService {
  private readonly MAX_ITEMS = 4;
  private readonly STORAGE_KEY = 'lastViewed';
  constructor() { }

  addItem(item: any) {
    let items = this.getItems();
    
    items = items.filter((i: any) => i.reportId !== item.reportId); 
    items.unshift(item); 
    items = items.slice(0, this.MAX_ITEMS);
    console.log(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  getItems(): any[] {
    const itemsString = localStorage.getItem(this.STORAGE_KEY);
    return itemsString ? JSON.parse(itemsString) : [];
  }
}
