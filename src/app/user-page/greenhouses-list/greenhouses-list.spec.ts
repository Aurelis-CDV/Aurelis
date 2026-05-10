import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreenhousesList } from './greenhouses-list';

describe('GreenhousesList', () => {
  let component: GreenhousesList;
  let fixture: ComponentFixture<GreenhousesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenhousesList],
    }).compileComponents();

    fixture = TestBed.createComponent(GreenhousesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
