import { Component } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { ActivitySettings } from "./activity/activity-settings";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title='race-comparison';

  private numActivities = 3;

  private activitySettingsChangeSubjects = Array(this.numActivities).fill(undefined).map(
    () => new BehaviorSubject<ActivitySettings>(null),
  );

  activitySettingsChanges = this.activitySettingsChangeSubjects.map(
    subject => {
      return subject.pipe(
        filter(settingsChange => !!settingsChange)
      );
    }
  );

  /**
   * Whether to display activities on separate maps
   */
  displaySeparateMaps: boolean = false;

  /**
   * Callback for settings change
   * @param activitySettingsChange 
   * @param index 
   */
  onActivitySettingsChange(activitySettingsChange: ActivitySettings, index: number): void {
    this.activitySettingsChangeSubjects[index].next(activitySettingsChange);
  }

  /**
   * Callback for checkbox
   * @param event 
   */
  onDisplaySeparateMapsChange(event): void {
    this.displaySeparateMaps = (<HTMLInputElement>event.target).checked;
  }

  /**
   * Whether there is an activity loaded at an index
   * @param index 
   */
  hasActivity(index: number): boolean {
    return !!this.activitySettingsChangeSubjects[index].value;
  }

  get canDisplaySeparateMaps(): boolean {
    if(this.displaySeparateMaps) {
      let found = 0;
      for(let activitySettingsChange of this.activitySettingsChangeSubjects) {
        if(activitySettingsChange.value) {
          if(found === 1) {
            return true;
          }
          ++found;
        }
      }
    }
    return false;
  }
}
