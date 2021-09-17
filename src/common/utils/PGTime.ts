/**
 * An enumeration of the possible values for the AM/PM portion of the time,
 * when rendered in 12-hour format
 */
export enum MERIDIAN {
  AM = 'AM',
  PM = 'PM',
}

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

  /**
   * A regex that strictly matches against the postgres format, for validation
   */
  public static readonly strictRegex =/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9](\.[0-9]{3})?)?$/;

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
   * Display the timestamp in the original format
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

  /**
   * Display the timestamp without seconds or milliseconds, as used in an input
   * element
   */
  public get inputString(): string {
    return `${
      this.hour.toString().padStart(2, '0')
    }:${
      this.minute.toString().padStart(2, '0')
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
   * Get the unpadded hour for display in 12-hour format
   */
  public get displayHour(): string {
    if (this.hour === 0) {
      return '12';
    }
    if (this.hour > 12) {
      return (this.hour - 12).toString();
    }
    return this.hour.toString();
  }

  /**
   * Get just the AM/PM portion of the timestamp, for rendering in 12 hour format
   */
  public get meridian(): MERIDIAN {
    return this.hour < 12 ? MERIDIAN.AM : MERIDIAN.PM;
  }

  /**
   * Returns an AM/PM formatted hour heading
   */
  public get hourHeading(): string {
    return `${this.displayHour} ${this.meridian}`;
  }

  /**
   * Show the hour:minute with AM/PM
   */
  public get displayTime(): string {
    return `${
      this.displayHour
    }:${
      this.minute.toString().padStart(2, '0')
    } ${
      this.meridian
    }`;
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

  /**
   * Static method to convert a given timestamp to Display format (i.e. 12 hour
   * AM/PM time). It's just a wrapper around
   *
   *     new PGTime(<timestamp>).displayTime
   *
   * but it returns null for falsy values (e.g. null, undefined, ''), where the
   * constructor would throw an error
   */
  public static toDisplay(timestamp: string): string {
    if (!timestamp) {
      return null;
    }
    return new PGTime(timestamp).displayTime;
  }

  /**
   * Attempts to parse an AM/PM style timestamp into a PGTime instance. This
   * may not cover every possible format, but should hit most of our use cases.
   */
  public static fromDisplay(ampmTimestamp: string): PGTime {
    if (!ampmTimestamp) {
      return null;
    }
    const displayTimeRegex = /^(?<hour>0?[1-9]|1[0-2])(:(?<minute>[0-5][0-9])?(:(?<second>[0-5][0-9])?)?)?(\s*(?<meridian>[ap]\.?m?\.?|[AP]\.?M?\.?)?)?$/;
    const timeMatch = displayTimeRegex.exec(ampmTimestamp);
    if (
      timeMatch === null
      || timeMatch.groups === undefined
      || timeMatch.groups.hour === undefined
    ) {
      throw new TypeError('Invalid timestamp format');
    }
    let hour = parseInt(timeMatch.groups.hour, 10);
    if (timeMatch.groups.meridian && ['p', 'P'].includes(timeMatch.groups.meridian[0])) {
      hour = hour === 12 ? 12 : hour + 12;
    } else if (hour === 12) {
      hour = 0;
    }
    const minute = timeMatch.groups.minute
      ? parseInt(timeMatch.groups.minute, 10)
      : 0;
    const second = timeMatch.groups.second
      ? parseInt(timeMatch.groups.second, 10)
      : 0;
    return new PGTime(`${
      hour.toString().padStart(2, '0')
    }:${
      minute.toString().padStart(2, '0')
    }:${
      second.toString().padStart(2, '0')
    }`);
  }
}
