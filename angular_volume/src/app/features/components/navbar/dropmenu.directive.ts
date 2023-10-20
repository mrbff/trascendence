import { AfterViewInit, Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDropmenu]',
})
export class DropmenuDirective implements AfterViewInit {
  private icon: any;
  private background: any;
  private clickCount: number;

  constructor() {
    this.clickCount = 0;
  }
  ngAfterViewInit(): void {
    this.icon = document.querySelector('.responsive');
    this.background = document.querySelector('.backresp');
  }

  @HostListener('click') onMouseClick() {
    if (this.clickCount === 0) {
      this.showMenu();
    } else if (this.clickCount === 1) {
      this.hideMenu();
    }
    this.clickCount = (this.clickCount + 1) % 2;
  }

  showMenu() {
    this.icon.style.display = 'block';
    this.background.style.display = 'block';
  }

  hideMenu() {
    this.icon.style.display = 'none';
    this.background.style.display = 'none';
  }
}
