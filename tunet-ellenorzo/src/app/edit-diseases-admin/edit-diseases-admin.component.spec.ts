import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDiseasesAdminComponent } from './edit-diseases-admin.component';

describe('EditDiseasesAdminComponent', () => {
  let component: EditDiseasesAdminComponent;
  let fixture: ComponentFixture<EditDiseasesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDiseasesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDiseasesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
