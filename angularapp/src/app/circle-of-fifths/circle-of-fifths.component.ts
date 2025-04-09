// circle-of-fifths.component.ts
import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { MusicSelectionService } from '../services/music-selection.service';

@Component({
  selector: 'app-circle-of-fifths',
  templateUrl: './circle-of-fifths.component.html',
  styleUrls: ['./circle-of-fifths.component.css']
})
export class CircleOfFifthsComponent implements AfterViewInit {
  @Output() keySelected: EventEmitter<string> = new EventEmitter<string>();

  // Innermost ring: Major keys
  majorKeys: string[] = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  // Middle ring: Minor keys
  minorKeys: string[] = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
  // Outermost ring: Diminished chords (created by appending "dim" to each major key)
  diminishedKeys: string[] = ['Bdim', 'F#dim', 'C#dim', 'G#dim', 'D#dim', 'A#dim', 'Fdim', 'Cdim', 'Gdim', 'Ddim', 'Adim', 'Edim'];

  // Radii definitions for each ring:
  // Major (innermost): from 70 to 110
  majorInner: number = 70;
  majorOuter: number = 110;
  // Minor (middle): from 110 to 150
  minorInner: number = 110;
  minorOuter: number = 150;
  // Diminished (outermost): from 150 to 190
  diminishedInner: number = 150;
  diminishedOuter: number = 190;

  constructor(private musicService: MusicSelectionService) { }

  ngAfterViewInit() {
    this.renderCircle();

    // Subscribe to external changes of the selected root note.
    this.musicService.rootNote$.subscribe(rootNote => {
      this.highlightRoot(rootNote);
    });
  }

  renderCircle() {
    const width = 500;
    const height = 500;

    const svg = d3.select('#circleOfFifths')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Center the group inside the SVG.
    const group = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create a tooltip element.
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#333')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '13px')
      .style('opacity', 0);

    // Create a common pie layout for all rings.
    const pie = d3.pie<string>()
      .value(() => 1)
      .sort(null)
      .startAngle(-Math.PI / 2);

    // Compute arc data arrays.
    const majorArcs = pie(this.majorKeys);
    const minorArcs = pie(this.minorKeys);
    const diminishedArcs = pie(this.diminishedKeys);

    // Define arc generators for each ring.
    const majorArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.majorInner)
      .outerRadius(this.majorOuter);

    const minorArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.minorInner)
      .outerRadius(this.minorOuter);

    const diminishedArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.diminishedInner)
      .outerRadius(this.diminishedOuter);

    // Define label arcs to center text within each slice.
    const majorLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.majorInner + this.majorOuter) / 2)
      .outerRadius((this.majorInner + this.majorOuter) / 2);

    const minorLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.minorInner + this.minorOuter) / 2)
      .outerRadius((this.minorInner + this.minorOuter) / 2);

    const diminishedLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.diminishedInner + this.diminishedOuter) / 2)
      .outerRadius((this.diminishedInner + this.diminishedOuter) / 2);

    // === Render Innermost Ring: Major Keys ===
    majorArcs.forEach((d) => {
      const key = d.data;
      const g = group.append('g')
        .attr('class', 'major-key')
        .attr('data-key', key);

      g.append('path')
        .attr('d', majorArc(d)!)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .style('cursor', 'pointer')
        .on('click', () => this.selectMajor(g, key))
        .on('mouseover', (event: any) => {
          tooltip.transition().duration(100).style('opacity', 0.9);
          tooltip.html(`Major: ${key}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mousemove', (event: any) => {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.transition().duration(100).style('opacity', 0);
        });

      const [labelX, labelY] = majorLabelArc.centroid(d);
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(key)
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    });

    // === Render Middle Ring: Minor Keys ===
    minorArcs.forEach((d) => {
      const key = d.data;
      const g = group.append('g')
        .attr('class', 'minor-key')
        .attr('data-key', key);

      g.append('path')
        .attr('d', minorArc(d)!)
        .attr('fill', 'lightyellow')
        .attr('stroke', 'black')
        .style('cursor', 'pointer')
        .on('click', () => this.selectMinor(g, key))
        .on('mouseover', (event: any) => {
          tooltip.transition().duration(100).style('opacity', 0.9);
          tooltip.html(`Minor: ${key}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mousemove', (event: any) => {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.transition().duration(100).style('opacity', 0);
        });

      const [labelX, labelY] = minorLabelArc.centroid(d);
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(key)
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    });

    // === Render Outermost Ring: Diminished Keys ===
    diminishedArcs.forEach((d) => {
      const key = d.data;
      const g = group.append('g')
        .attr('class', 'diminished-key')
        .attr('data-key', key);

      g.append('path')
        .attr('d', diminishedArc(d)!)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .style('cursor', 'pointer')
        .on('click', () => this.selectDiminished(g, key))
        .on('mouseover', (event: any) => {
          tooltip.transition().duration(100).style('opacity', 0.9);
          tooltip.html(`Diminished: ${key}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mousemove', (event: any) => {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.transition().duration(100).style('opacity', 0);
        });

      const [labelX, labelY] = diminishedLabelArc.centroid(d);
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(key)
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    });
  }

  // Instead of directly changing fill colors here, we update the shared MusicSelectionService.
  selectMajor(group: any, key: string) {
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  selectMinor(group: any, key: string) {
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  selectDiminished(group: any, key: string) {
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  // This method updates the fill colors based on the external selected root note.
  // In this example we highlight the matching key in the major (innermost) ring with red,
  // and reset the other rings to their default fills.
  highlightRoot(selectedRoot: string) {
    d3.selectAll('.major-key').each(function () {
      const group = d3.select(this);
      const key = group.attr('data-key');
      group.select('path').attr('fill', key === selectedRoot ? 'red' : 'white');
    });
    d3.selectAll('.minor-key').each(function () {
      d3.select(this).select('path').attr('fill', 'lightyellow');
    });
    d3.selectAll('.diminished-key').each(function () {
      d3.select(this).select('path').attr('fill', 'white');
    });
  }
}
