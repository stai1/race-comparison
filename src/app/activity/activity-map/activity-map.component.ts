import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { delay, Observable, Subject, takeUntil } from 'rxjs';
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
  private mapElementRef: ElementRef<HTMLDivElement>;

  private activitySettingsList: ActivitySettings[];

  private map: OlMap;

  private destroyed = new Subject<void>();

  private changed = new Subject<void>();

  private lineStrings: Feature<LineString>[];

  private lineStringLayerSource: VectorSource<Geometry> = new VectorSource({wrapX: true});

  constructor(
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if('activitySettingsChanges' in changes) {
      this.changed.next();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initActivitySettings();
    this.observeActivitySettingsChanges();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  initMap(): void {
    const mapSource = new OSM();
    this.map = new OlMap({
      target: this.mapElementRef.nativeElement,
      layers: [
        new TileLayer({source: mapSource}),
        new VectorLayer({ source: this.lineStringLayerSource }),
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
    this.lineStringLayerSource.addFeatures(this.lineStrings);
  }

  initActivitySettings() {
    // initialize activity settings array with length of number of activities
    this.activitySettingsList = this.activitySettingsChanges.map(() => null);
  }

  observeActivitySettingsChanges(): void {
    for(let i = 0; i < this.activitySettingsChanges.length; ++i) {
      const activitySettingsChange$ = this.activitySettingsChanges[i];
      activitySettingsChange$.pipe(
        takeUntil(this.changed),
        takeUntil(this.destroyed),
        delay(0), // bad hack to cause map size updating to occur after the container element is resized
      ).subscribe(
        activitySettings => {
          this.updateActivitySettings(activitySettings, i);
          this.map.updateSize();
          this.fitBounds();
        }
      );
    }
  }

  updateActivitySettings(activitySettings: ActivitySettings, index: number) {
    this.activitySettingsList[index] = activitySettings;
    const coordinates = activitySettings.activity.points
      .slice(activitySettings.startTimeOffset, activitySettings.endTimeOffset + 1)
      .map(
        point => fromLonLat([point.lon, point.lat])
      );
    let lineString = this.lineStrings[index];

    lineString.getGeometry().setCoordinates(coordinates);
  }

  fitBounds() {
    this.map.getView().fit(this.lineStringLayerSource.getExtent(), {
      padding: [32, 32, 32, 32],
    });
  }

}
