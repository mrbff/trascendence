import { AfterViewInit, Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDropmenu]',
})
export class DropmenuDirective implements AfterViewInit {
  private icon: any;
  private background: any;
  private click: boolean;

  constructor() {
    this.click = false;
  }
  ngAfterViewInit(): void {
    this.icon = document.querySelector('.responsive');
    this.background = document.querySelector('.backresp');
  }

  @HostListener('click') onMouseClick() {
    this.click = !this.click;
    if (this.click === true) {
      this.showMenu();
    } else {
      this.hideMenu();
    }
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
