import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidesPage } from './guides-page';

describe('GuidesPage', () => {
  let component: GuidesPage;
  let fixture: ComponentFixture<GuidesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(GuidesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
