import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  constructor() {}

  private codeSubject = new BehaviorSubject<string>('');

  code$ = this.codeSubject.asObservable();

  setCode(code: string) {
    this.codeSubject.next(code);
    this.codeSubject.next(''); // is this leagal? I don't think so
  }

  emitCode(): Promise<string> {
    return new Promise<string>((resolve) =>
      this.code$.subscribe((code) => {
        if (code) {
          resolve(code);
        }
      })
    );
  }
}
