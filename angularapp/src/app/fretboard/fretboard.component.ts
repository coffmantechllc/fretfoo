import { Component, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { MusicSelectionService } from '../services/music-selection.service';

@Component({
  selector: 'app-fretboard',
  templateUrl: './fretboard.component.html',
  styleUrls: ['./fretboard.component.css']
})
export class FretboardComponent implements AfterViewInit {
  strings = ['E', 'B', 'G', 'D', 'A', 'E'];
  frets = 24;
  noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  majorScaleSemiTones = [0, 2, 4, 5, 7, 9, 11];
  majorIntervalColors = ['red', 'brown', 'yellow', 'green', 'blue', 'orange', 'violet'];

  minorScaleSemiTones = [0, 2, 3, 5, 7, 8, 10];
  minorIntervalColors = ['red', 'brown', 'yellow', 'green', 'blue', 'orange', 'violet'];

  selectedNotes: Set<string> = new Set();
  private svg: any;
  selectedScaleType: string = 'major';
  private selectedRoot: string = 'C';

  constructor(private musicService: MusicSelectionService) { }

  ngAfterViewInit() {
    this.renderFretboard();

    this.musicService.rootNote$.subscribe(rootNote => {
      this.selectedRoot = rootNote;
      this.highlightNotes(rootNote);
    });

    this.musicService.scaleType$.subscribe(scaleType => {
      this.selectedScaleType = scaleType;
      this.highlightNotes(this.selectedRoot);
    });
  }

  renderFretboard() {
    const width = 1000;
    const height = 300;
    const circleRadius = 10;
    const offsetX = circleRadius + 50;
    const stringSpacing = height / (this.strings.length + 1);
    const fretSpacing = width / (this.frets + 1);

    this.svg = d3.select("#fretboard").append("svg")
      .attr("width", width + offsetX + 100)
      .attr("height", height);

    // Create a layer for strings behind notes
    const stringLayer = this.svg.append("g").attr("class", "string-layer");

    // Create nut note group above string layer
    const nutGroup = this.svg.append("g")
      .attr("class", "nut-group")
      .attr("transform", `translate(${offsetX - fretSpacing}, 0)`);

    this.strings.forEach((note, i) => {
      const y = (i + 1) * stringSpacing;

      // Draw strings first (behind notes)
      stringLayer.append("line")
        .attr("x1", offsetX - fretSpacing)
        .attr("y1", y)
        .attr("x2", width + offsetX)
        .attr("y2", y)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      // Draw nut open note
      const group = nutGroup.append("g")
        .attr("transform", `translate(0, ${y})`)
        .attr("class", "nut-note-group")
        .attr("data-note", note);

      group.append("rect")
        .attr("x", -30)
        .attr("y", -12)
        .attr("width", 60)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

      group.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", circleRadius)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      group.append("text")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("font-size", "10px")
        .attr("font-family", "verdana")
        .attr("fill", "black")
        .text(note);
    });

    // Draw frets and note positions
    for (let fret = 1; fret <= this.frets; fret++) {
      this.svg.append("line")
        .attr("x1", fret * fretSpacing + offsetX)
        .attr("y1", stringSpacing)
        .attr("x2", fret * fretSpacing + offsetX)
        .attr("y2", height - stringSpacing)
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

      this.strings.forEach((openNote, stringIndex) => {
        const openNoteIndex = this.noteNames.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        const noteName = this.noteNames[noteIndex];

        const group = this.svg.append("g")
          .attr("transform", `translate(${fret * fretSpacing + offsetX}, ${(stringIndex + 1) * stringSpacing})`)
          .attr("class", "note-group")
          .attr("data-note", noteName);

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
          .attr("fill", "black");
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

    // Add fret markers
    const fretMarkers = [1, 3, 5, 7, 9, 12, 15, 17, 19, 21];
    fretMarkers.forEach(fret => {
      const x = fret * fretSpacing + offsetX - fretSpacing / 2;
      if (fret === 12) {
        this.svg.append("circle").attr("cx", x).attr("cy", (height / 2) - 10).attr("r", 5).attr("fill", "gray").attr("stroke", "black");
        this.svg.append("circle").attr("cx", x).attr("cy", (height / 2) + 10).attr("r", 5).attr("fill", "gray").attr("stroke", "black");
      } else {
        this.svg.append("circle").attr("cx", x).attr("cy", height / 2).attr("r", 5).attr("fill", "gray").attr("stroke", "black");
      }
    });
  }

  highlightNotes(selectedRoot: string) {
    let scaleSemiTones: number[];
    let scaleIntervalColors: string[];

    if (this.selectedScaleType === 'major') {
      scaleSemiTones = this.majorScaleSemiTones;
      scaleIntervalColors = this.majorIntervalColors;
    } else {
      scaleSemiTones = this.minorScaleSemiTones;
      scaleIntervalColors = this.minorIntervalColors;
    }

    const rootIdx = this.noteNames.indexOf(selectedRoot);

    d3.selectAll(".note-group").each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      const note = group.attr("data-note");
      const noteIdx = this.noteNames.indexOf(note);
      const interval = (noteIdx - rootIdx + 12) % 12;

      let degreeIndex = -1;
      for (let j = 0; j < scaleSemiTones.length; j++) {
        if (scaleSemiTones[j] === interval) {
          degreeIndex = j;
          break;
        }
      }

      const fillColor = degreeIndex !== -1 ? scaleIntervalColors[degreeIndex] : "white";
      group.select("circle").attr("fill", fillColor);
      group.select("text").attr("fill", this.getLabelColor(fillColor));
    });

    d3.selectAll(".nut-note-group").each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      const note = group.attr("data-note");
      const noteIdx = this.noteNames.indexOf(note);
      const interval = (noteIdx - rootIdx + 12) % 12;

      let degreeIndex = -1;
      for (let j = 0; j < scaleSemiTones.length; j++) {
        if (scaleSemiTones[j] === interval) {
          degreeIndex = j;
          break;
        }
      }

      const fillColor = degreeIndex !== -1 ? scaleIntervalColors[degreeIndex] : "white";
      const textColor = this.getLabelColor(fillColor);

      group.select("circle").attr("fill", fillColor);
      group.select("text").attr("fill", textColor);
    });
  }

  private getLabelColor(bg: string): string {
    const darkColors = ['brown', 'blue', 'violet', 'green'];
    return darkColors.includes(bg.toLowerCase()) ? 'white' : 'black';
  }
}
