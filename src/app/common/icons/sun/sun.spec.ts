import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sun } from './sun';

describe('Sun', () => {
  let component: Sun;
  let fixture: ComponentFixture<Sun>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sun],
    }).compileComponents();

    fixture = TestBed.createComponent(Sun);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
