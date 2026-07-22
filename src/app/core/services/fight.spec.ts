import { TestBed } from '@angular/core/testing';

import { Fight } from './fight.service';

describe('Fight', () => {
  let service: Fight;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fight);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
