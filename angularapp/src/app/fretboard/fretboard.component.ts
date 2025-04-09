// fretboard.component.ts
import { Component, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { MusicSelectionService } from '../services/music-selection.service';

@Component({
  selector: 'app-fretboard',
  templateUrl: './fretboard.component.html',
  styleUrls: ['./fretboard.component.css']
})
export class FretboardComponent implements AfterViewInit {
  // Standard tuning strings for a guitar.
  strings = ['E', 'B', 'G', 'D', 'A', 'E'];
  // Total number of frets.
  frets = 24;
  // Chromatic scale used for note computation.
  noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Mapping for a Major scale (expressed in semitones).
  majorScaleSemiTones: number[] = [0, 2, 4, 5, 7, 9, 11];
  majorIntervalColors: string[] = ['red', 'brown', 'yellow', 'green', 'blue', 'orange', 'violet'];

  // Mapping for a Natural Minor scale (expressed in semitones).
  minorScaleSemiTones: number[] = [0, 2, 3, 5, 7, 8, 10];
  minorIntervalColors: string[] = ['red', 'brown', 'yellow', 'green', 'blue', 'orange', 'violet'];

  // New array representing the scale degrees (1 through 7).
  scaleIntervalsOfInterest: number[] = [1, 2, 3, 4, 5, 6, 7];

  // (Optional) for manual note toggling.
  selectedNotes: Set<string> = new Set();
  private svg: any;

  // Current scale type (defaults to "major").
  selectedScaleType: string = 'major';

  constructor(private musicService: MusicSelectionService) { }

  ngAfterViewInit() {
    this.renderFretboard();

    // Subscribe to root note changes.
    this.musicService.rootNote$.subscribe(rootNote => {
      this.highlightNotes(rootNote);
    });
    // Subscribe to scale type changes.
    this.musicService.scaleType$.subscribe(scaleType => {
      this.selectedScaleType = scaleType;
      // Optionally, re-highlight using the current root (if stored).
    });
  }

  renderFretboard() {
    const width = 600;
    const height = 300;
    this.svg = d3.select("#fretboard").append("svg")
      .attr("width", width)
      .attr("height", height);

    const stringSpacing = height / (this.strings.length + 1);
    const fretSpacing = width / (this.frets + 1);
    const circleRadius = 10;
    const offsetX = circleRadius; // Offset to properly position circles

    // Draw strings.
    this.strings.forEach((_, i) => {
      this.svg.append("line")
        .attr("x1", 0)
        .attr("y1", (i + 1) * stringSpacing)
        .attr("x2", width)
        .attr("y2", (i + 1) * stringSpacing)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });

    // Draw frets and note circles.
    for (let fret = 0; fret <= this.frets; fret++) {
      this.svg.append("line")
        .attr("x1", fret * fretSpacing + offsetX)
        .attr("y1", stringSpacing)
        .attr("x2", fret * fretSpacing + offsetX)
        .attr("y2", height - stringSpacing)
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

      this.strings.forEach((openNote, stringIndex) => {
        // Calculate the note index for the fret.
        const openNoteIndex = this.noteNames.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        const noteName = this.noteNames[noteIndex];
        const key = `${stringIndex}-${fret}`;

        const group = this.svg.append("g")
          .attr("transform", `translate(${fret * fretSpacing + offsetX}, ${(stringIndex + 1) * stringSpacing})`)
          .attr("class", "note-group")
          .attr("data-note", noteName)
          .style("cursor", "pointer")
          .on("click", () => this.toggleNote(group.select("circle"), key));

        group.append("circle")
          .attr("r", circleRadius)
          .attr("fill", "white")
          .attr("stroke", "black");

        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("font-size", "10px")
          .attr("font-family", "verdana")
          .text(noteName)
          .style("pointer-events", "none");
      });
    }

    // --- Add Legend ---
    const legendData = [
      { label: 'Root', color: 'red' },
      { label: '2nd', color: 'brown' },
      { label: '3rd', color: 'yellow' },
      { label: '4th', color: 'green' },
      { label: '5th', color: 'blue' },
      { label: '6th', color: 'orange' },
      { label: '7th', color: 'violet' }
    ];

    const legendGroup = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, ${height - 20})`);

    legendData.forEach((d, i) => {
      const xOffset = i * 90;
      const itemGroup = legendGroup.append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(${xOffset}, 0)`);

      itemGroup.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d.color)
        .attr("stroke", "black");

      itemGroup.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(d.label)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .attr("font-family", "verdana");
    });
  }

  toggleNote(circle: any, key: string) {
    if (this.selectedNotes.has(key)) {
      this.selectedNotes.delete(key);
      circle.attr("fill", "white");
    } else {
      this.selectedNotes.add(key);
      circle.attr("fill", "red");
    }
  }

  // Highlight each note on the fretboard based on its interval (in semitones) relative to the selected root.
  // The relationship is defined using the scaleIntervalsOfInterest (degrees 1 to 7) and the corresponding semitone mappings.
  highlightNotes(selectedRoot: string) {
    let mapping: number[];
    let scaleIntervalColors: string[];
    if (this.selectedScaleType === 'major') {
      mapping = this.majorScaleSemiTones;
      scaleIntervalColors = this.majorIntervalColors;
    } else {
      mapping = this.minorScaleSemiTones;
      scaleIntervalColors = this.minorIntervalColors;
    }
    const noteNames = this.noteNames;
    const rootIdx = noteNames.indexOf(selectedRoot);

    d3.selectAll(".note-group").each(function () {
      const group = d3.select(this);
      const note = group.attr("data-note");
      const noteIdx = noteNames.indexOf(note);
      const interval = (noteIdx - rootIdx + 12) % 12;

      // Determine the scale degree index based on the relationship with scaleIntervalsOfInterest.
      // We assume mapping[i] corresponds to scale degree i+1.
      let degreeIndex = -1;
      for (let i = 0; i < 7; i++) {
        if (mapping[i] === interval) {
          degreeIndex = i;
          break;
        }
      }
      const fillColor = degreeIndex !== -1 ? scaleIntervalColors[degreeIndex] : "white";
      group.select("circle").attr("fill", fillColor);
    });
  }
}
