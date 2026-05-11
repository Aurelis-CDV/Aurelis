import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Close } from './close';

describe('Close', () => {
  let component: Close;
  let fixture: ComponentFixture<Close>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Close],
    }).compileComponents();

    fixture = TestBed.createComponent(Close);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
