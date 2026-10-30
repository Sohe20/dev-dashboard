import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberFormModal } from './member-form-modal';

describe('MemberFormModal', () => {
  let component: MemberFormModal;
  let fixture: ComponentFixture<MemberFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberFormModal],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
