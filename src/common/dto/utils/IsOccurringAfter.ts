import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PGTime } from '../../utils/PGTime';

/**
 * Validation decorator to check that a time field occurs after another field
 * in the same object. This will be used to check that the endTime of a course
 * meeting is after the startTime.
 */

export default function IsOccurringAfter<DTO>(
  property: string & keyof DTO,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function IsOccurringAfterValidator(
    object: DTO,
    propertyName: string & keyof DTO
  ): void {
    registerDecorator({
      name: 'isOccurringAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const target = args.object as DTO;
          const [otherProp] = args.constraints as (string & keyof DTO)[];
          const otherTimestamp = target[otherProp];
          if (typeof otherTimestamp === 'string') {
            try {
              const thisTime = new PGTime(value);
              const otherTime = new PGTime(otherTimestamp);
              return thisTime.isAfter(otherTime);
            } catch (err) {
              if (err instanceof TypeError) {
                return false;
              }
              throw err;
            }
          }
          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must occur after ${args.constraints[0] as string}`;
        },
      },
    });
  };
}
