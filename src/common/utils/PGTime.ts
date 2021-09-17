/**
 * A utility class to simplify handling timestamps generated from Postgres.
 * Provides helpers for time comparisons, and formatting.
 */

export class PGTime {
  /**
   * A static RegExp that matches a wide range of 24-hour HH:MM:SS.mmm
   * formatted timestamps
   */
  private readonly regex = /^(?<hour>[01]?[0-9]|2[0-3])(:(?<minute>[0-5][0-9])(:(?<second>[0-5][0-9])(\.(?<millisecond>[0-9][0-9]?[0-9]?)?)?)?)?$/;

  /** The hour part of the timestamp */
  public readonly hour: number;

  /** The minute part of the timestamp */
  public readonly minute: number;

  /** The second part of the timestamp */
  public readonly second: number;

  /** The millisecond part of the timestamp */
  public readonly millisecond: number;

  /**
   * Parses a string timestamp to create a PGTime instance.
   * The timestamp should be in 24-hour format, with
   * - One or two digits in the hour
   * - Optionally two digits in the minute
   * - Optionally two digits in the second
   * - Optionally one to three digits in the millisecond
   *
   * e.g., the string "13" will be treated the same as "13:00:00.000"
   *
   * Constructor will throw a TypeError if provided with a bad timestamp
   */
  public constructor(timestamp: string) {
    const timeMatch = this.regex.exec(timestamp);
    if (
      timeMatch === null
      || timeMatch.groups === undefined
      || timeMatch.groups.hour === undefined
    ) {
      throw new TypeError('Invalid timestamp format');
    }
    this.hour = parseInt(timeMatch.groups.hour, 10);
    this.minute = timeMatch.groups.minute
      ? parseInt(timeMatch.groups.minute, 10)
      : 0;
    this.second = timeMatch.groups.second
      ? parseInt(timeMatch.groups.second, 10)
      : 0;
    this.millisecond = timeMatch.groups.millisecond
      ? parseInt(timeMatch.groups.millisecond, 10)
      : 0;
  }

  /**
   * Display the timestamp in the original fomat
   */
  public toString(): string {
    return `${
      this.hour.toString().padStart(2, '0')
    }:${
      this.minute.toString().padStart(2, '0')
    }:${
      this.second.toString().padStart(2, '0')
    }.${
      this.millisecond.toString().padStart(3, '0')
    }`;
  }

  public toRequestString(): string {
    return `${
      this.hour.toString().padStart(2, '0')
    }:${
      this.minute.toString().padStart(2, '0')
    }:${
      this.second.toString().padStart(2, '0')
    }`;
  }

  /**
   * Converts the time into the number of milliseconds that have elapsed since
   * midnight before. Used for comparisons.
   */
  public get msSinceMidnight(): number {
    const secondToMS = this.second * 1000;
    const minuteToMS = this.minute * 60 * 1000;
    const hourToMS = this.hour * 60 * 60 * 1000;
    return this.millisecond + secondToMS + minuteToMS + hourToMS;
  }

  /**
   * Show the hour:minute with AM/PM
   */
  public get displayTime(): string {
    const meridian = this.hour < 12 ? 'AM' : 'PM';
    const twelveHourFmt = this.hour > 12 ? this.hour - 12 : this.hour;
    return `${
      twelveHourFmt.toString().padStart(2, '0')
    }:${
      this.minute.toString().padStart(2, '0')
    } ${meridian}`;
  }

  /**
   * Determine if this time is the same as another instance
   */
  public isSameAs(compTime: PGTime):boolean {
    return this.msSinceMidnight === compTime.msSinceMidnight;
  }

  /**
   * Determine if this time occurs before another instance
   */
  public isBefore(compTime: PGTime): boolean {
    return this.msSinceMidnight < compTime.msSinceMidnight;
  }

  /**
   * Determine if this time occurs after another instance
   */
  public isAfter(compTime: PGTime): boolean {
    return this.msSinceMidnight > compTime.msSinceMidnight;
  }
}
