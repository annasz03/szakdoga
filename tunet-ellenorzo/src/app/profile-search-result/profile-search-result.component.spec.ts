import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSearchResultComponent } from './profile-search-result.component';

describe('ProfileSearchResultComponent', () => {
  let component: ProfileSearchResultComponent;
  let fixture: ComponentFixture<ProfileSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSearchResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
