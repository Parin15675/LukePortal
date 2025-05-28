import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  public breadcrumbs$ = this.breadcrumbs.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this.createBreadcrumbs(this.activatedRoute.root))
    ).subscribe(breadcrumbs => {
      this.breadcrumbs.next(breadcrumbs);
    });
  }
  private createBreadcrumbs(route: ActivatedRoute, routeUrl: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeSnapshot = child.snapshot;
      const urlSegment = routeSnapshot.url.map(segment => segment.path).join('/');
      const breadcrumbLabel = routeSnapshot.data['breadcrumb'];

      if (breadcrumbLabel != null && urlSegment) {
        // Correctly define breadcrumbUrl within this block
        const breadcrumbUrl = routeUrl === '/' ? `/${urlSegment}` : `${routeUrl}/${urlSegment}`;
        breadcrumbs.push({ label: breadcrumbLabel, url: breadcrumbUrl });

        // Pass breadcrumbUrl to the recursive call
        this.createBreadcrumbs(child, breadcrumbUrl, breadcrumbs);
      } else {
        // If there's no breadcrumb, still call the function recursively,
        // but pass along the current routeUrl without change
        this.createBreadcrumbs(child, routeUrl, breadcrumbs);
      }
    }

    return breadcrumbs;
  }
}

