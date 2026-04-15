import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInWindow } from './log-in-window';

describe('LogInWindow', () => {
  let component: LogInWindow;
  let fixture: ComponentFixture<LogInWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogInWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(LogInWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
