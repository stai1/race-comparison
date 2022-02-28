import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { getDistance } from 'ol/sphere';
import { Activity, ActivityPoint, RawActivity, RawActivityPoint } from '../activity';
import { ActivitySettings } from '../activity-settings';

@Component({
  selector: 'app-activity-options',
  templateUrl: './activity-options.component.html',
  styleUrls: ['./activity-options.component.scss']
})
export class ActivityOptionsComponent implements OnInit {

  @Output()
  activitySettingsChange = new EventEmitter<ActivitySettings>();

  activity: Activity;

  constructor() { }

  ngOnInit(): void {
  }

  onFileSelected(event: Event) {
    const file = (<HTMLInputElement> event.target).files[0]
    const fileReader = new FileReader();
    fileReader.onload = event => {
      this.activity = this.loadRoute(event.target.result as string, file.name.split('.').pop());
      this.activitySettingsChange.emit({
        activity: this.activity
      });
    }
    fileReader.readAsText(file);
  }

  loadRoute(content: string, extension: string): Activity {
    let rawActivity: RawActivity;
    switch(extension) {
      case 'gpx':
        rawActivity = this.loadGpx(content);
        break;
      default:
        alert(`.${extension} files are not support yet`);
    }
    return this.processRawActivity(rawActivity);
  }

  loadGpx(content: string): RawActivity {
    const domParser = new DOMParser();
    const xmlDoc = domParser.parseFromString(content, 'text/xml');
    let name = xmlDoc.getElementsByTagName('metadata')[0]?.getElementsByTagName('name')[0]?.textContent;
    if(!name) {
      name = xmlDoc.getElementsByTagName('trk')[0]?.getElementsByTagName('name')[0]?.textContent;
    }

    const points: RawActivityPoint[] = [];

    try {
      const firstTime = this.convertIsoDateToSeconds(xmlDoc.getElementsByTagName('trkpt')[0].getElementsByTagName('time')[0].textContent);
      for(const trkpt of xmlDoc.getElementsByTagName('trkpt')) {
        const time = this.convertIsoDateToSeconds(trkpt.getElementsByTagName('time')[0].textContent);
        points.push({
          timeSinceStart: time - firstTime,
          lat: parseFloat(trkpt.getAttribute('lat')),
          lon: parseFloat(trkpt.getAttribute('lon')),
        });
      }
    }
    catch(error) {
      alert('File import failed');
      return null;
    }
    return {
      name: name,
      points: points,
    };
  }

  private convertIsoDateToSeconds(isoDate: string): number {
    return new Date(isoDate).getTime()/1000;
  }

  /**
   * Convert raw activity to activity with speed, distance
   * @param rawActivity 
   * @returns 
   */
  private processRawActivity(rawActivity: RawActivity): Activity {
    const rawPoints = rawActivity.points;
    const points: ActivityPoint[] = [];

    points.push({
      ...rawPoints[0],
      calculatedDistance: 0,
      calculatedSpeed: 0,
    });
    for(let i = 1; i < rawPoints.length; ++i) {
      const rawPoint = rawPoints[i];
      const previousPoint = points[points.length - 1];

      let distanceChange = this.distanceBetweenPoints(rawPoint, previousPoint);
      let timeChange = rawPoint.timeSinceStart - previousPoint.timeSinceStart;
      let speed = distanceChange/timeChange;

      // update previous point speed such that it results in the current point location
      previousPoint.calculatedSpeed = speed;

      points.push({
        ...rawPoint,
        calculatedDistance: previousPoint.calculatedDistance + distanceChange,
        calculatedSpeed: speed, // reuse previous point speed; prevents last point from having 0 speed
      });
    }

    return {
      name: rawActivity.name,
      points: points,
    }
  }

  private distanceBetweenPoints(point1: RawActivityPoint, point2: RawActivityPoint): number {
    return getDistance([point1.lon, point1.lat], [point2.lon, point2.lat]);
  }
}
