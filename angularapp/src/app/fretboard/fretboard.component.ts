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

  chromaticSemitonesIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  chromaticSemiToneColors = ['#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#008000', '#008080', '#0000FF', '#4B0082', '#800080', '#C71585'];
  chromaticSemiToneIndexShape: string[] = [
    'rect',    // 0 - Root
    'circle',  // 1 - b2nd
    'rect',    // 2 - 2nd
    'circle',  // 3 - b3rd
    'rect',    // 4 - 3rd
    'circle',  // 5 - 4th
    'rect',    // 6 - b5th
    'circle',  // 7 - 5th
    'rect',    // 8 - b6th
    'circle',  // 9 - 6th
    'rect',    // 10 - b7th
    'circle'   // 11 - 7th
  ];

  majorScaleSemiTonesIndex = [0, 2, 4, 5, 7, 9, 11];
  majorIntervalColors = ['#FF0000', '#FFA500', '#FFFF00', '#ADFF2F', '#008080', '#4B0082', '#C71585'];

  minorScaleSemiTones = [0, 2, 3, 5, 7, 8, 10];
  minorIntervalColors = ['#FF0000', '#FFA500', '#FFD700', '#ADFF2F', '#008080', '#0000FF', '#800080'];

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
    const legendHeight = 60;
    const totalHeight = height + legendHeight;
    const circleRadius = 10;
    const offsetX = circleRadius + 50;
    const stringSpacing = height / (this.strings.length + 1);
    const fretSpacing = width / (this.frets + 1);

    this.svg = d3.select("#fretboard").append("svg")
      .attr("width", width + offsetX + 100)
      .attr("height", totalHeight);

    const stringLayer = this.svg.append("g").attr("class", "string-layer");

    const nutGroup = this.svg.append("g")
      .attr("class", "nut-group")
      .attr("transform", `translate(${offsetX - fretSpacing}, 0)`);

    this.strings.forEach((note, i) => {
      const y = (i + 1) * stringSpacing;

      stringLayer.append("line")
        .attr("x1", offsetX - fretSpacing)
        .attr("y1", y)
        .attr("x2", width + offsetX)
        .attr("y2", y)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

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
        let shape = this.getNoteShape(noteIndex);
        if (shape === 'circle') {
          group.append("circle")
            .attr("r", circleRadius)
            .attr("fill", "white")
            .attr("stroke", "black");
        }
        if (shape === 'rect') {
          group.append("rect")
            .attr("x", -10)
            .attr("y", -10)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "white")
            .attr("stroke", "black");
        }

        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("font-size", "10px")
          .attr("font-family", "verdana")
          .text(noteName)
          .attr("fill", "black");
      });
    }

    const legendData = [
      { label: 'Root', color: '#FF0000', shape: 'rect' },
      { label: 'b2nd', color: '#FF4500', shape: 'circle' },
      { label: '2nd', color: '#FFA500', shape: 'rect' },
      { label: 'b3rd', color: '#FFD700', shape: 'circle' },
      { label: '3rd', color: '#FFFF00', shape: 'rect' },
      { label: '4th', color: '#ADFF2F', shape: 'circle' },
      { label: 'b5th', color: '#008000', shape: 'rect' },
      { label: '5th', color: '#008080', shape: 'circle' },
      { label: 'b6th', color: '#0000FF', shape: 'rect' },
      { label: '6th', color: '#4B0082', shape: 'circle' },
      { label: 'b7th', color: '#800080', shape: 'rect' },
      { label: '7th', color: '#C71585', shape: 'circle' }
    ];

    const legendGroup = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, ${height + 10})`);

    legendData.forEach((d, i) => {
      const xOffset = i * 90;
      const itemGroup = legendGroup.append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(${xOffset}, 0)`);

      if (d.shape === 'rect') {
        itemGroup.append("rect")
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", d.color)
          .attr("stroke", "black");
      } else if (d.shape === 'circle') {
        itemGroup.append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 10)
          .attr("fill", d.color)
          .attr("stroke", "black");
      }

      itemGroup.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(d.label)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .attr("font-family", "verdana");
    });

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

    switch (this.selectedScaleType) {
      case 'major':
        scaleSemiTones = this.majorScaleSemiTonesIndex;
        scaleIntervalColors = this.majorIntervalColors;
        break;
      case 'minor':
        scaleSemiTones = this.minorScaleSemiTones;
        scaleIntervalColors = this.minorIntervalColors;
        break;
      case 'chromatic':
        scaleSemiTones = this.chromaticSemitonesIndex;
        scaleIntervalColors = this.chromaticSemiToneColors;
        break;
      default:
        return;
    }

    const rootIdx = this.noteNames.indexOf(selectedRoot);

    d3.selectAll(".note-group").each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      const note = group.attr("data-note");
      const noteIdx = this.noteNames.indexOf(note);
      const interval = (noteIdx - rootIdx + 12) % 12;

      let fillColor = "white";

      if (this.selectedScaleType === 'chromatic') {
        fillColor = this.chromaticSemiToneColors[interval]; // direct mapping
      } else {
        const degreeIndex = scaleSemiTones.indexOf(interval);
        if (degreeIndex !== -1) {
          fillColor = scaleIntervalColors[degreeIndex];
        }
      }
      let shape = this.getNoteShape(noteIdx);

      group.select(shape).attr("fill", fillColor);
      group.select("text").attr("fill", this.getLabelColor(fillColor));
    });


    d3.selectAll(".nut-note-group").each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      const note = group.attr("data-note");
      const noteIdx = this.noteNames.indexOf(note);
      const interval = (noteIdx - rootIdx + 12) % 12;

      let fillColor = "white";

      if (this.selectedScaleType === 'chromatic') {
        fillColor = this.chromaticSemiToneColors[interval];
      } else {
        const degreeIndex = scaleSemiTones.indexOf(interval);
        if (degreeIndex !== -1) {
          fillColor = scaleIntervalColors[degreeIndex];
        }
      }
      
      group.select("circle").attr("fill", fillColor);
      group.select("text").attr("fill", this.getLabelColor(fillColor));
    });
  }

  private getLabelColor(bg: string): string {
    const darkColors = ['#FF0000', '#0000FF', '#4B0082', '#008080', '#C71585', '#800080'];
    return darkColors.includes(bg.toUpperCase()) ? 'white' : 'black';
  }

  private getNoteShape(interval: number): string {
    return this.chromaticSemiToneIndexShape[interval];
  }
}
