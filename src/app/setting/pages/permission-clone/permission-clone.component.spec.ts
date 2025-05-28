import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionCloneComponent } from './permission-clone.component';

describe('PermissionCloneComponent', () => {
  let component: PermissionCloneComponent;
  let fixture: ComponentFixture<PermissionCloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionCloneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionCloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
