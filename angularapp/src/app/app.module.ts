import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { FretboardComponent } from './fretboard/fretboard.component';
import { ScaleSelectorComponent } from './scale-selector/scale-selector.component';
import { CircleOfFifthsComponent } from './circle-of-fifths/circle-of-fifths.component';

@NgModule({
  declarations: [
    AppComponent,
    FretboardComponent,
    ScaleSelectorComponent,
    CircleOfFifthsComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
