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
  diminishedKeys: string[] = ['B°', 'Gb°', 'Db°', 'Ab°', 'Eb°', 'Bb°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];

  majorInner: number = 70;
  majorOuter: number = 110;

  minorInner: number = 110;
  minorOuter: number = 150;

  diminishedInner: number = 150;
  diminishedOuter: number = 190;

  // Local property for scale type.
  selectedScaleType: string = 'major';

  // Consolidated color array for scale degrees 1–7.
  scaleDegreeColors: string[] = ['#FF0000', '#FFA500', '#FFFF00', '#ADFF2F', '#008080', '#4B0082', '#C71585'];

  // Scale mappings (in semitones) for degrees 1–7.
  // Major scale: [0, 2, 4, 5, 7, 9, 11]
  majorScaleSemiTonesIndex: number[] = [0, 2, 4, 5, 7, 9, 11];
  // Natural Minor scale: [0, 2, 3, 5, 7, 8, 10]
  minorScaleSemiTones: number[] = [0, 2, 3, 5, 7, 8, 10];

  // Universal note order for computing intervals.
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
      // Optionally re-highlight if needed.
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

  // When a major key is selected, set scale type to "major".
  selectMajor(group: any, key: string) {
    this.musicService.setScaleType("major");
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  // When a minor key is selected, set scale type to "minor" and remove trailing "m".
  selectMinor(group: any, key: string) {
    this.musicService.setScaleType("minor");
    const baseKey = key.replace(/\s*m$/, '');
    this.musicService.setRootNote(baseKey);
    this.keySelected.emit(key);
  }

  selectDiminished(group: any, key: string) {
    // We keep diminished selection as is.
    this.musicService.setRootNote(key);
    this.keySelected.emit(key);
  }

  // ---------------------------
  // Updated highlightRoot() using the consolidated color mapping.
  // In addition to previous behavior,
  // - Map 2nd and 3rd tones to the minor ring (using brown and yellow),
  // - And adjust label text color if the background is dark.
  highlightRoot(selectedRoot: string) {
    const unotes = this.universalNotes;
    const rootIdx = unotes.indexOf(selectedRoot);

    let relativeMajor: string, relativeMinor: string;
    if (this.selectedScaleType === 'major' || this.selectedScaleType === 'chromatic') {
      relativeMajor = selectedRoot;
      relativeMinor = unotes[(rootIdx + 9) % 12];
    } else {
      const baseMinor = selectedRoot.replace(/\s*m$/, '');
      relativeMajor = unotes[(unotes.indexOf(baseMinor) + 3) % 12];
      relativeMinor = baseMinor;
    }

    // Helper to choose a contrasting text color.
    const getLabelColor = (bg: string): string => {
      const darkColors = ['#FF0000', '#0000FF', '#4B0082', '#008080', '#C71585', '#800080'];
      return darkColors.includes(bg.toUpperCase()) ? 'white' : 'black';
    };

    // Compute relative major degrees.
    const relMajIdx = unotes.indexOf(relativeMajor);
    const relMaj2nd = unotes[(relMajIdx + this.majorScaleSemiTonesIndex[1]) % 12];  // degree 2
    const relMaj3rd = unotes[(relMajIdx + this.majorScaleSemiTonesIndex[2]) % 12];  // degree 3
    const relMaj4th = unotes[(relMajIdx + this.majorScaleSemiTonesIndex[3]) % 12];  // degree 4
    const relMaj5th = unotes[(relMajIdx + this.majorScaleSemiTonesIndex[4]) % 12];  // degree 5

    if (this.selectedScaleType === 'major' || this.selectedScaleType === 'chromatic') {
      // Major ring: highlight 1st, 4th, and 5th of the relative major.
      d3.selectAll('.major-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const key = group.attr('data-key');
        let fillColor = 'white';
        if (key === relativeMajor) {
          fillColor = this.scaleDegreeColors[0]; 
        } else if (key === relMaj4th) {
          fillColor = this.scaleDegreeColors[3];
        } else if (key === relMaj5th) {
          fillColor = this.scaleDegreeColors[4]; 
        }
        group.select('path').attr('fill', fillColor);
        group.select('text').attr('fill', getLabelColor(fillColor));
      });

      // Minor ring: highlight relative minor (degree 6, orange) and also map 2nd and 3rd degrees.
      d3.selectAll('.minor-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const keyRaw = group.attr('data-key');
        const baseKey = keyRaw.replace(/m$/, '');
        let fillColor = 'lightyellow';
        if (baseKey === relativeMinor) {
          fillColor = this.scaleDegreeColors[5]; 
        } else if (baseKey === relMaj2nd) {
          fillColor = this.scaleDegreeColors[1]; 
        } else if (baseKey === relMaj3rd) {
          fillColor = this.scaleDegreeColors[2]; 
        }
        group.select('path').attr('fill', fillColor);
        group.select('text').attr('fill', getLabelColor(fillColor));
      });
    } else if (this.selectedScaleType === 'minor') {
      // In minor mode, highlight in the major ring the relative major's 1st, 4th, and 5th.
      d3.selectAll('.major-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const key = group.attr('data-key');
        let fillColor = 'white';
        if (key === relativeMajor) {
          fillColor = this.scaleDegreeColors[0]; 
        } else if (key === relMaj4th) {
          fillColor = this.scaleDegreeColors[3]; 
        } else if (key === relMaj5th) {
          fillColor = this.scaleDegreeColors[4]; 
        }
        group.select('path').attr('fill', fillColor);
        group.select('text').attr('fill', getLabelColor(fillColor));
      });

      // Minor ring: highlight the selected minor (after stripping "m") with degree 6,
      // and map 2nd and 3rd of the relative major.
      d3.selectAll('.minor-key').each((_, i, nodes) => {
        const group = d3.select(nodes[i]);
        const keyRaw = group.attr('data-key');
        const baseKey = keyRaw.replace(/m$/, '');
        let fillColor = 'lightyellow';
        if (baseKey === relativeMinor) {
          fillColor = this.scaleDegreeColors[5]; 
        } else if (baseKey === relMaj2nd) {
          fillColor = this.scaleDegreeColors[1]; 
        } else if (baseKey === relMaj3rd) {
          fillColor = this.scaleDegreeColors[2]; 
        }
        group.select('path').attr('fill', fillColor);
        group.select('text').attr('fill', getLabelColor(fillColor));
      });
    }

    // Always reset the diminished ring, then highlight the major 7th.
    d3.selectAll('.diminished-key').each((_, i, nodes) => {
      const group = d3.select(nodes[i]);
      const diminishedKey = group.attr('data-key').replace(/°/g, '');
      let major7th: string;
      if (this.selectedScaleType === 'major' || this.selectedScaleType === 'chromatic') {
        major7th = unotes[(rootIdx + 11) % 12];
      } else {
        const baseMinor = selectedRoot.replace(/\s*m$/, '');
        const relMaj = unotes[(unotes.indexOf(baseMinor) + 3) % 12];
        major7th = unotes[(unotes.indexOf(relMaj) + 11) % 12];
      }
      const fillColor = (diminishedKey === major7th) ? this.scaleDegreeColors[6] : 'white';
      group.select('path').attr('fill', fillColor);
      group.select('text').attr('fill', getLabelColor(fillColor));
    });
  }
}
