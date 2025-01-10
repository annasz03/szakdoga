import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedDiseasesComponent } from './saved-diseases.component';

describe('SavedDiseasesComponent', () => {
  let component: SavedDiseasesComponent;
  let fixture: ComponentFixture<SavedDiseasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedDiseasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedDiseasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
