import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { parse, isAfter } from 'date-fns';

/**
 * Validation decorator to check that a time field is after occuring after
 * another field in the same object. This will be used to check that the
 * endTime of a course meeting is after the start time.
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
          const otherTime = target[otherProp];
          if (typeof otherTime === 'string') {
            const thisTimeAsDate = parse(value, 'HH:mm:ssx', new Date());
            const otherTimeAsDate = parse(otherTime, 'HH:mm:ssx', new Date());
            return isAfter(thisTimeAsDate, otherTimeAsDate);
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
