// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedKey: string = '';

  onKeySelect(selectedKey: string) {
    this.selectedKey = selectedKey;
  }
}
