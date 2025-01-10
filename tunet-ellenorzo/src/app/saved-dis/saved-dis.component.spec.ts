import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedDisComponent } from './saved-dis.component';

describe('SavedDisComponent', () => {
  let component: SavedDisComponent;
  let fixture: ComponentFixture<SavedDisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedDisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedDisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
