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
  // Middle ring: Minor keys (with a trailing " m")
  minorKeys: string[] = ['Am', 'Em', 'Bm', 'Gbm', 'Dbm', 'Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
  // Outermost ring: Diminished keys (explicitly defined)
  diminishedKeys: string[] = ['Bø', 'Gbø', 'Dbø', 'Abø', 'Ebø', 'Bbø', 'Fø', 'Cø', 'Gø', 'Dø', 'Aø', 'Eø'];

  majorInner: number = 70;
  majorOuter: number = 110;

  minorInner: number = 110;
  minorOuter: number = 150;

  diminishedInner: number = 150;
  diminishedOuter: number = 190;

  // Local property for scale type.
  selectedScaleType: string = 'major';

  // Consolidated color array for scale degrees 1-7.
  // Degree 1 → red, 2 → brown, 3 → yellow, 4 → green, 5 → blue, 6 → orange, 7 → violet.
  scaleDegreeColors: string[] = ['red', 'brown', 'yellow', 'green', 'blue', 'orange', 'violet'];

  // Scale mappings (semitones for degrees 1–7).
  // Major scale: Degree 1:0, 2:2, 3:4, 4:5, 5:7, 6:9, 7:11.
  majorScaleSemiTones: number[] = [0, 2, 4, 5, 7, 9, 11];
  // Natural Minor scale: Degree 1:0, 2:2, 3:3, 4:5, 5:7, 6:8, 7:10.
  minorScaleSemiTones: number[] = [0, 2, 3, 5, 7, 8, 10];

  // Universal note order for computing relative intervals.
  universalNotes: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  constructor(private musicService: MusicSelectionService) { }

  ngAfterViewInit() {
    this.renderCircle();

    // Subscribe to root note changes.
    this.musicService.rootNote$.subscribe(rootNote => {
      this.highlightRoot(rootNote);
    });
    // Subscribe to scale type changes.
    this.musicService.scaleType$.subscribe(scaleType => {
      this.selectedScaleType = scaleType;
      // Optionally re-highlight (if desired, based on stored root note)
    });
  }

  renderCircle() {
    const width = 500;
    const height = 500;

    const svg = d3.select('#circleOfFifths')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Center the group.
    const group = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create a tooltip.
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

    const pie = d3.pie<string>()
      .value(() => 1)
      .sort(null)
      .startAngle(-Math.PI / 2);

    const majorArcs = pie(this.majorKeys);
    const minorArcs = pie(this.minorKeys);
    const diminishedArcs = pie(this.diminishedKeys);

    const majorArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.majorInner)
      .outerRadius(this.majorOuter);
    const minorArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.minorInner)
      .outerRadius(this.minorOuter);
    const diminishedArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(this.diminishedInner)
      .outerRadius(this.diminishedOuter);

    const majorLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.majorInner + this.majorOuter) / 2)
      .outerRadius((this.majorInner + this.majorOuter) / 2);
    const minorLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.minorInner + this.minorOuter) / 2)
      .outerRadius((this.minorInner + this.minorOuter) / 2);
    const diminishedLabelArc = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius((this.diminishedInner + this.diminishedOuter) / 2)
      .outerRadius((this.diminishedInner + this.diminishedOuter) / 2);

    // === Render Innermost Ring: Major keys.
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

    // === Render Middle Ring: Minor keys.
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

    // === Render Outermost Ring: Diminished keys.
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
        .on('mouseout', (event: any) => {
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

  // When a major key is selected.
  selectMajor(group: any, key: string) {
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  // When a minor key is selected, strip any trailing "m".
  selectMinor(group: any, key: string) {
    const baseKey = key.replace(/\s*m$/, '');
    this.musicService.setRootNote(baseKey);
    this.keySelected.emit(key);
  }

  selectDiminished(group: any, key: string) {
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  // ---------------------------
  // Updated highlightRoot() using the consolidated color mapping.
  // Additionally, highlight the major 7th degree on the diminished arc.
  highlightRoot(selectedRoot: string) {
    const unotes = this.universalNotes;
    const rootIdx = unotes.indexOf(selectedRoot);

    if (this.selectedScaleType === 'major') {
      // For a major scale, relative minor is 9 semitones up.
      const relativeMinor = unotes[(rootIdx + 9) % 12];
      // Major ring: highlight the arc that matches the selected root with degree 1 (red).
      d3.selectAll('.major-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const key = group.attr('data-key');
        group.select('path').attr('fill', key === selectedRoot ? this.scaleDegreeColors[0] : 'white');
      });
      // Minor ring: highlight the arc that matches the relative minor with degree 6 (orange).
      d3.selectAll('.minor-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const keyRaw = group.attr('data-key');
        const key = keyRaw.replace(/m$/, '');
        group.select('path').attr('fill', key === relativeMinor ? this.scaleDegreeColors[5] : 'lightyellow');
      });
    } else if (this.selectedScaleType === 'minor') {
      // For a minor scale, relative major is 3 semitones up.
      const relativeMajor = unotes[(rootIdx + 3) % 12];
      // Minor ring: highlight the arc that matches the selected minor root (strip "m") with degree 6 (orange).
      d3.selectAll('.minor-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const keyRaw = group.attr('data-key');
        const key = keyRaw.replace(/m$/, '');
        group.select('path').attr('fill', key === selectedRoot ? this.scaleDegreeColors[5] : 'lightyellow');
      });
      // Major ring: highlight the arc that matches the relative major with degree 1 (red).
      d3.selectAll('.major-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const key = group.attr('data-key');
        group.select('path').attr('fill', key === relativeMajor ? this.scaleDegreeColors[0] : 'white');
      });
    }

    // Now, regardless of scale type, compute the major 7th.
    // If scale type is major, major 7th = (root + 11) mod 12.
    // If minor, compute relative major first, then major 7th = (relativeMajor + 11) mod 12.
    let computedMajor7th: string;
    if (this.selectedScaleType === 'major') {
      computedMajor7th = unotes[(rootIdx + 11) % 12];
    } else { // minor
      const baseMinor = selectedRoot.replace(/\s*m$/, '');
      const relativeMajor = unotes[(unotes.indexOf(baseMinor) + 3) % 12];
      computedMajor7th = unotes[(unotes.indexOf(relativeMajor) + 11) % 12];
    }
    // Highlight the diminished ring arc that corresponds to the computed major 7th.
    d3.selectAll('.diminished-key').each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      // Remove the 'ø' character from the diminished key.
      const diminishedKeyRaw = group.attr('data-key');
      const diminishedKey = diminishedKeyRaw.replace(/ø/g, '');
      group.select('path').attr('fill', (diminishedKey === computedMajor7th) ? this.scaleDegreeColors[6] : 'white');
    });
  }
  // ---------------------------
}
