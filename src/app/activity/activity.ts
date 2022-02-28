export interface RawActivity {
  name: string;
  points: RawActivityPoint[];
}

export interface Activity extends RawActivity {
  name: string;
  points: ActivityPoint[];
}

export interface RawActivityPoint {
  timeSinceStart: number;
  lat: number;
  lon: number;
  originalSpeed?: number;
  originalDistance?: number;
}
export interface ActivityPoint extends RawActivityPoint{
  calculatedSpeed: number;
  calculatedDistance: number;
}