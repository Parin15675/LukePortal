import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupBuComponent } from './popup-bu.component';

describe('PopupBuComponent', () => {
  let component: PopupBuComponent;
  let fixture: ComponentFixture<PopupBuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupBuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupBuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
