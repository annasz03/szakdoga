import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedDocumentsComponent } from './shared-documents.component';

describe('SharedDocumentsComponent', () => {
  let component: SharedDocumentsComponent;
  let fixture: ComponentFixture<SharedDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
