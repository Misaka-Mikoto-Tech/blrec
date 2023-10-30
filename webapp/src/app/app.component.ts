import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'B 站直播录制';
  theme: 'light' | 'dark' = 'light';

  loading = false;
  collapsed = false;
  useDrawer = false;
  destroyed = new Subject<void>();

  constructor(
    router: Router,
    changeDetector: ChangeDetectorRef,
    breakpointObserver: BreakpointObserver,
    private auth: AuthService
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
        // close the drawer
        if (this.useDrawer) {
          this.collapsed = true;
        }
      } else if (event instanceof NavigationEnd) {
        this.loading = false;
      }
    });

    // use drawer as side nav for x-small device
    breakpointObserver
      .observe(Breakpoints.XSmall)
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => {
        this.useDrawer = state.matches;
        // ensure the drawer is closed
        if (this.useDrawer) {
          this.collapsed = true;
        }
        changeDetector.markForCheck();
      });

    // display task cards as many as possible
    // max-width: card-width(400px) * 2 + gutter(12px) + padding(12px) * 2 + sidenav(200px)
    breakpointObserver
      .observe('(max-width: 1036px)')
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => {
        this.collapsed = state.matches;
        changeDetector.markForCheck();
      });
  }
  ngOnInit(): void {
    let url = new URL(location.href);
    let api_key = url.searchParams.get('api-key');
    api_key && this.auth.setApiKey(api_key);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
