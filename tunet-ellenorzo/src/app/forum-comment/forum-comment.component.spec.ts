import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumCommentComponent } from './forum-comment.component';

describe('ForumCommentComponent', () => {
  let component: ForumCommentComponent;
  let fixture: ComponentFixture<ForumCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
