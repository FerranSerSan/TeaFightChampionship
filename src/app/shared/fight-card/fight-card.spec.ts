import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightCard } from './fight-card';

describe('FightCard', () => {
  let component: FightCard;
  let fixture: ComponentFixture<FightCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FightCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FightCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
