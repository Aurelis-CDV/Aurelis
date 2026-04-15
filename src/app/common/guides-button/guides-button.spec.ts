import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidesButton } from './guides-button';

describe('GuidesButton', () => {
  let component: GuidesButton;
  let fixture: ComponentFixture<GuidesButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesButton],
    }).compileComponents();

    fixture = TestBed.createComponent(GuidesButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
