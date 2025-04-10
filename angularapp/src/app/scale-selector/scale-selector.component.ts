import { Component, OnInit } from '@angular/core';
import { MusicSelectionService } from '../services/music-selection.service';

@Component({
  selector: 'app-scale-selector',
  templateUrl: './scale-selector.component.html',
  styleUrls: ['./scale-selector.component.css']
})
export class ScaleSelectorComponent implements OnInit {
  selectedScaleType: string = 'major';
  selectedScaleContext: string = 'full';
  selectedRootNote: string = 'C';
  noteNames: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  constructor(private musicService: MusicSelectionService) { }

  ngOnInit(): void {
    // Subscribe to root note changes.
    this.musicService.rootNote$.subscribe(rootNote => {
      this.selectedRootNote = rootNote;
    });
    // Subscribe to scale type changes so the dropdown reflects the current scale type.
    this.musicService.scaleType$.subscribe(scaleType => {
      this.selectedScaleType = scaleType;
    });
  }

  onRootNoteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRootNote = target.value;
    this.musicService.setRootNote(this.selectedRootNote);
  }

  onScaleTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    // Update the service so that other components (and this one) are in sync.
    const scaleType = target.value.toLowerCase();
    this.selectedScaleType = scaleType;
    this.musicService.setScaleType(scaleType);
  }
}
