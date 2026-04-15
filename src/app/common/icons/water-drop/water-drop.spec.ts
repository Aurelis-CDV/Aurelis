import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDrop } from './water-drop';

describe('WaterDrop', () => {
  let component: WaterDrop;
  let fixture: ComponentFixture<WaterDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDrop],
    }).compileComponents();

    fixture = TestBed.createComponent(WaterDrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
