import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb, BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  template: `
  <div class="breadcrumbs-space">
    <ng-container *ngFor="let breadcrumb of breadcrumbs$ | async; let last = last">
      <span *ngIf="!last; else lastBreadcrumb">
        <a [routerLink]="[breadcrumb.url]">{{ breadcrumb.label }}</a> <mat-icon>navigate_next</mat-icon>
      </span>
      <ng-template #lastBreadcrumb>{{ breadcrumb.label }}</ng-template>
    </ng-container>
  </div>
`,
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = breadcrumbService.breadcrumbs$;
  }

  ngOnInit(): void {}
}