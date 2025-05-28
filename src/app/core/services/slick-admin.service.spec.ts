import { TestBed } from '@angular/core/testing';

import { SlickAdminService } from './slick-admin.service';

describe('SlickAdminService', () => {
  let service: SlickAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlickAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
