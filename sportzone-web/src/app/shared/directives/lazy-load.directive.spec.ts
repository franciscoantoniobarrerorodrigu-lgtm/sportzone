import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LazyLoadDirective } from './lazy-load.directive';

@Component({
  template: `
    <img appLazyLoad [src]="imageSrc" [placeholder]="placeholderSrc" alt="Test Image">
  `,
  standalone: true,
  imports: [LazyLoadDirective]
})
class TestComponent {
  imageSrc = 'https://example.com/image.jpg';
  placeholderSrc = 'https://example.com/placeholder.jpg';
}

describe('LazyLoadDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let imgElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, LazyLoadDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    imgElement = fixture.debugElement.query(By.css('img'));
  });

  it('should create an instance', () => {
    expect(imgElement).toBeTruthy();
  });

  it('should add lazy-loading class on init', () => {
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.classList.contains('lazy-loading')).toBe(true);
  });

  it('should set placeholder image if provided', () => {
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.src).toContain('placeholder.jpg');
  });

  it('should apply default background color when no placeholder provided', () => {
    component.placeholderSrc = '';
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.style.backgroundColor).toBe('rgb(26, 26, 26)');
  });

  it('should handle missing src gracefully', () => {
    component.imageSrc = '';
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should clean up observer on destroy', () => {
    fixture.detectChanges();
    // Simply verify that destroy doesn't throw errors
    expect(() => fixture.destroy()).not.toThrow();
  });
});
