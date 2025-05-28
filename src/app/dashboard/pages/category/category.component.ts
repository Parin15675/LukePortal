import { Component } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';
import { LastviewedService } from '../../services/lastviewed.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {

  categoryList = [
    {
      name: 'Reconcile',
      params: 'reconcile',
      imageUrl: './assets/images/Order Reconcile.png'
    },
    {
      name: 'Analyst',
      params: 'analyst',
      imageUrl: './assets/images/Order Reconcile.png'
    }
  ]
  itemLastViewed: any;
  private readonly STORAGE_KEY = 'lastViewed';

  constructor(private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private lastViewedService: LastviewedService,
    private router: Router,) { }
  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        console.log('result', result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });
    this.itemLastViewed = this.lastViewedService.getItems();
    console.log( this.itemLastViewed );
    
  }
  navigateToDetail(item: any) {
    const queryParams = {
      workspaceId: item.workspaceId,
      reportId: item.reportId,
    };
    console.log(item);
    this.lastViewedService.addItem(item);
    this.router.navigate(['/report'], { queryParams: queryParams });
  }



}
