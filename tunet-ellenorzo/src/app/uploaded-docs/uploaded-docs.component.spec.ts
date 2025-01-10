import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadedDocsComponent } from './uploaded-docs.component';

describe('UploadedDocsComponent', () => {
  let component: UploadedDocsComponent;
  let fixture: ComponentFixture<UploadedDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadedDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadedDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
