import { Component } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  images = [700, 800, 807].map((n) => `https://picsum.photos/id/${n}/900/500`);
  showCarousel = true;
  constructor(config: NgbCarouselConfig) {
    // 
    config.interval = 5000;
    config.keyboard = true;
    config.pauseOnHover = true;
  }
}
