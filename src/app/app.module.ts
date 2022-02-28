import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ActivityOptionsComponent } from './activity/activity-options/activity-options.component';
import { ActivityMapComponent } from './activity/activity-map/activity-map.component';

@NgModule({
  declarations: [
    AppComponent,
    ActivityOptionsComponent,
    ActivityMapComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
