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

  // Called when the root note dropdown changes.
  onRootNoteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRootNote = target.value;
    this.musicService.setRootNote(this.selectedRootNote);
  }

  // Called when the scale type dropdown changes.
  onScaleTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedScaleType = target.value.toLowerCase();
    this.musicService.setScaleType(this.selectedScaleType);
  }
}
