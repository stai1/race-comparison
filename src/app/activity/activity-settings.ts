import { Activity } from './activity';

export interface ActivitySettings {
  activity: Activity;

  /**
   * number of seconds since start where the activity start should be considered (inclusive)
   */
  startTimeOffset: number;

  /**
   * number of seconds since start where the activity end should be considered (inclusive)
   */
  endTimeOffset: number;
}
