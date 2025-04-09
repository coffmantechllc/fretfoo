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
  
  // Color array for each semitone interval.
  // intervalColors[0] corresponds to the root (0 semitones, red),
  // intervalColors[1] to 1 semitone, and so on.
  intervalColors = ['red', 'white', 'brown', 'white', 'yellow', 'green',
    'white', 'blue', 'white', 'orange', 'white', 'violet'];

  // (Optional) for manual note toggling – may be left unused.
  selectedNotes: Set<string> = new Set();

  private svg: any;

  constructor(private musicService: MusicSelectionService) { }

  ngAfterViewInit() {
    this.renderFretboard();

    // Subscribe to changes in the selected root note.
    this.musicService.rootNote$.subscribe(rootNote => {
      this.highlightNotes(rootNote);
    });
  }

  renderFretboard() {
    const width = 600;
    const height = 300;
    this.svg = d3.select("#fretboard").append("svg")
      .attr("width", width)
      .attr("height", height);

    // Determine spacing between strings and frets.
    const stringSpacing = height / (this.strings.length + 1);
    const fretSpacing = width / (this.frets + 1);
    const circleRadius = 10;
    const offsetX = circleRadius; // Offset to properly position circles

    // Draw the strings as horizontal lines.
    this.strings.forEach((_, i) => {
      this.svg.append("line")
        .attr("x1", 0)
        .attr("y1", (i + 1) * stringSpacing)
        .attr("x2", width)
        .attr("y2", (i + 1) * stringSpacing)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });

    // Draw the frets (vertical lines) and add note circles.
    for (let fret = 0; fret <= this.frets; fret++) {
      this.svg.append("line")
        .attr("x1", fret * fretSpacing + offsetX)
        .attr("y1", stringSpacing)
        .attr("x2", fret * fretSpacing + offsetX)
        .attr("y2", height - stringSpacing)
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

      // For each string, compute the note at this fret.
      this.strings.forEach((openNote, stringIndex) => {
        // Calculate the note index for the given fret.
        const openNoteIndex = this.noteNames.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        const noteName = this.noteNames[noteIndex];
        // Key can be used if needed for further interactions.
        const key = `${stringIndex}-${fret}`;

        // Append a group element for this note.
        // The data attribute 'data-note' will be used later for coloring.
        const group = this.svg.append("g")
          .attr("transform", `translate(${fret * fretSpacing + offsetX}, ${(stringIndex + 1) * stringSpacing})`)
          .attr("class", "note-group")
          .attr("data-note", noteName)
          .style("cursor", "pointer")
          .on("click", () => this.toggleNote(group.select("circle"), key));

        // Append the circle representing the note.
        group.append("circle")
          .attr("r", circleRadius)
          .attr("fill", "white")
          .attr("stroke", "black");

        // Append a text label for the note.
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("font-size", "10px")
          .attr("font-family", "verdana")
          .text(noteName)
          .style("pointer-events", "none"); // Avoids interference with click events on the circle.
      });
    }

    // --- Add Legend ---
    // Legend mapping: Each item has a label and a corresponding color.
    const legendData = [
      { label: 'Root', color: 'red' },
      { label: '2nd', color: 'brown' },
      { label: '3rd', color: 'yellow' },
      { label: '4th', color: 'green' },
      { label: '5th', color: 'blue' },
      { label: '6th', color: 'orange' },
      { label: '7th', color: 'violet' }
    ];

    // Append a legend group at the bottom of the SVG.
    const legendGroup = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, ${height - 20})`); // Position near the bottom

    legendData.forEach((d, i) => {
      const xOffset = i * 90; // Horizontal spacing for legend items
      const itemGroup = legendGroup.append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(${xOffset}, 0)`);

      // Draw a colored rectangle as the background for the legend text.
      itemGroup.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d.color)
        .attr("stroke", "black");

      // Draw the label text next to the rectangle.
      itemGroup.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(d.label)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .attr("font-family", "verdana");
    });
  }

  // (Optional) Manual toggling if needed. This example focuses on automatic interval coloring.
  toggleNote(circle: any, key: string) {
    if (this.selectedNotes.has(key)) {
      this.selectedNotes.delete(key);
      circle.attr("fill", "white");
    } else {
      this.selectedNotes.add(key);
      // For manual toggling, you might choose to set a fixed color.
      // However, with automatic interval coloring, this function may not be used.
      circle.attr("fill", "red");
    }
  }

  // Highlight each note by computing its interval difference from the selected root,
  // and setting its fill color accordingly.
  highlightNotes(selectedRoot: string) {
    // Capture noteNames and intervalColors to be used inside the each() loop.
    const noteNames = this.noteNames;
    const intervalColors = this.intervalColors;

    // Iterate over each note group.
    d3.selectAll(".note-group").each(function () {
      const group = d3.select(this);
      const note = group.attr("data-note");
      // Get the indices for the note on the fretboard and the selected root note.
      const noteIdx = noteNames.indexOf(note);
      const rootIdx = noteNames.indexOf(selectedRoot);
      // Compute the interval (in semitones) relative to the selected root.
      const interval = (noteIdx - rootIdx + 12) % 12;
      // Use the interval as an index into the color array.
      const fillColor = intervalColors[interval];
      group.select("circle").attr("fill", fillColor);
    });
  }
}
