import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuManagementComponent } from './bu-management.component';

describe('BuManagementComponent', () => {
  let component: BuManagementComponent;
  let fixture: ComponentFixture<BuManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
