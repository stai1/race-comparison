import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityOptionsComponent } from './activity-options.component';

describe('ActivityOptionsComponent', () => {
  let component: ActivityOptionsComponent;
  let fixture: ComponentFixture<ActivityOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
