/**
 *  Various primitive/generic values for use in testing.
 *  Because hard-coding constants is unreliable and annoying.
 */

/**
 *  An array of strings
 */

export const array: string[] = ['Life', 'Universe', 'Everything'];

/**
 *  A single string
 */

export const string = "Don't Panic";

/**
 *  A single string with no spaces or special characters
 */

export const safeString = 'dont-panic';

/**
 *  An integer
 */

export const int = 42;

/**
 *  A single number representing a year
 */

export const year = 2018;

/**
 *  An 8-character numeric string representing a Harvard ID
 */

export const HUID = '88888888';

/**
 *  A string representing an email address
 */

export const email = 'help@seas.harvard.edu';

/**
 *  An error
 */

export const error = new Error('Error');
