import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Maximize } from './maximize';

describe('Maximize', () => {
  let component: Maximize;
  let fixture: ComponentFixture<Maximize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Maximize],
    }).compileComponents();

    fixture = TestBed.createComponent(Maximize);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
