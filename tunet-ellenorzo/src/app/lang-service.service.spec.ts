import { TestBed } from '@angular/core/testing';

import { LangServiceService } from './lang-service.service';

describe('LangServiceService', () => {
  let service: LangServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LangServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
