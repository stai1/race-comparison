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

  onActivitySettingsChange(activitySettingsChange: ActivitySettings, index: number) {
    this.activitySettingsChangeSubjects[index].next(activitySettingsChange);
  }
}
