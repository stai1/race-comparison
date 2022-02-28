import { Component } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { ActivitySettings } from "./activity/activity-settings";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private activitySettingsChangeSubjects = [
    new BehaviorSubject<ActivitySettings>(null),
  ];

  activitySettingsChanges = this.activitySettingsChangeSubjects.map(
    subject => {
      return subject.pipe(
        filter(settingsChange => !!settingsChange)
      );
    }
  );

  onLeftActivitySettingsChange(activitySettingsChange: ActivitySettings) {
    this.activitySettingsChangeSubjects[0].next(activitySettingsChange);
  }
}
