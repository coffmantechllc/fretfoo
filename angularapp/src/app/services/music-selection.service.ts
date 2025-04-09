import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicSelectionService {
  private rootNoteSubject = new BehaviorSubject<string>('C');
  rootNote$ = this.rootNoteSubject.asObservable();

  private scaleTypeSubject = new BehaviorSubject<string>('major');
  scaleType$ = this.scaleTypeSubject.asObservable();

  setRootNote(note: string) {
    this.rootNoteSubject.next(note);
  }

  setScaleType(scaleType: string) {
    this.scaleTypeSubject.next(scaleType);
  }
}
