import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Map as OlMap, View, Feature } from 'ol';
import { Geometry, LineString, Point } from 'ol/geom'
import {
  Tile as TileLayer,
  Vector as VectorLayer,
} from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source'; 
import VectorSource from 'ol/source/Vector';
import {Style, Stroke, Circle, Fill} from 'ol/style';
import { ActivitySettings } from "../activity-settings";

const LINE_STYLE = new Style({
  stroke: new Stroke({
    color: '#ff0000',
    width:3
  })
});

@Component({
  selector: 'app-activity-map',
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.scss']
})
export class ActivityMapComponent implements OnInit {

  @Input()
  activitySettingsChanges: Observable<ActivitySettings>[] = [];

  @ViewChild('map')
  private mapElement: ElementRef<HTMLDivElement>;

  private map: OlMap;

  private destroyed = new Subject<void>();

  lineStrings: Feature<LineString>[];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.observeActivitySettingsChanges();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  observeActivitySettingsChanges(): void {
    for(let i = 0; i < this.activitySettingsChanges.length; ++i) {
      const activitySettingsChange$ = this.activitySettingsChanges[i];
      activitySettingsChange$.pipe(
        takeUntil(this.destroyed)
      ).subscribe(
        activitySettings => {
          this.updateActivitySettings(activitySettings, i);
        }
      );
    }
  }

  initMap(): void {
    const mapSource = new OSM();
    const lineStringLayerSource = new VectorSource({wrapX: true});
    this.map = new OlMap({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({source: mapSource}),
        new VectorLayer({ source: lineStringLayerSource }),
      ],
      view: new View({
        center: fromLonLat([0,0]),
        zoom: 0,
      }),
    });

    this.lineStrings = this.activitySettingsChanges.map(
      () => new Feature<LineString>({geometry: new LineString([])})
    );

    this.lineStrings.forEach(
      lineString => lineString.setStyle(LINE_STYLE)
    );
    lineStringLayerSource.addFeatures(this.lineStrings);
  }

  updateActivitySettings(activitySettings: ActivitySettings, index: number) {
    const coordinates = activitySettings.activity.points.map(
      point => fromLonLat([point.lon, point.lat])
    );
    let lineString = this.lineStrings[index];

    lineString.getGeometry().setCoordinates(coordinates);
  }

}
