import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFinderPageComponent } from './doctor-finder-page.component';

describe('DoctorFinderPageComponent', () => {
  let component: DoctorFinderPageComponent;
  let fixture: ComponentFixture<DoctorFinderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFinderPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFinderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
