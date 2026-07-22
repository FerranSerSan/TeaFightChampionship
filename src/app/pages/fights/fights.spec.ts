import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fights } from './fights';

describe('Fights', () => {
  let component: Fights;
  let fixture: ComponentFixture<Fights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fights],
    }).compileComponents();

    fixture = TestBed.createComponent(Fights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
