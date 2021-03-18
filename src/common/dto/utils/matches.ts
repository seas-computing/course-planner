/**
 * A RegExp to match Postgres's time with timezone
 */
export const pgTimeTZ = /[0-2][0-9]:[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?-[0-1]?[0-9](:[0-5][0-9])?/;
