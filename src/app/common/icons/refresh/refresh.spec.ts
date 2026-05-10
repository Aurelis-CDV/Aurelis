import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Refresh } from './refresh';

describe('Refresh', () => {
  let component: Refresh;
  let fixture: ComponentFixture<Refresh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Refresh],
    }).compileComponents();

    fixture = TestBed.createComponent(Refresh);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
