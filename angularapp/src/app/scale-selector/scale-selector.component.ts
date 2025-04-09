// scale-selector.component.ts
import { Component } from '@angular/core';
import { MusicSelectionService } from '../services/music-selection.service';

@Component({
  selector: 'app-scale-selector',
  templateUrl: './scale-selector.component.html',
  styleUrls: ['./scale-selector.component.css']
})
export class ScaleSelectorComponent {
  selectedScaleType: string = 'major';
  selectedScaleContext: string = 'full';
  selectedRootNote: string = 'C';
  noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  constructor(private musicService: MusicSelectionService) { }

  // Call this method when a root note is selected (for example, via a button click)
  onRootNoteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRootNote = target.value;
    this.musicService.setRootNote(this.selectedRootNote);
  }
}
