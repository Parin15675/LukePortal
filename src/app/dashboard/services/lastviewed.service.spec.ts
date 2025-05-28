import { TestBed } from '@angular/core/testing';

import { LastviewedService } from './lastviewed.service';

describe('LastviewedService', () => {
  let service: LastviewedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastviewedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
