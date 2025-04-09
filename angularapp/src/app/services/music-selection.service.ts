import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicSelectionService {
  // Initial root note is 'C'
  private rootNoteSubject = new BehaviorSubject<string>('C');
  rootNote$ = this.rootNoteSubject.asObservable();

  setRootNote(note: string) {
    this.rootNoteSubject.next(note);
  }
}
