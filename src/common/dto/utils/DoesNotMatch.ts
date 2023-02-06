import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 *  Compare the current field against another in the same DTO to ensure that the
 * two do not match.
 *
 * @param property The field to compare against
 * @param validationOptions ValidationOptions
 */
export default function DoesNotMatch<DTO>(
  property: string & keyof DTO,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function DoesNotMatchValidator(
    object: DTO,
    propertyName: string & keyof DTO
  ): void {
    registerDecorator({
      name: 'doesNotMatch',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const target = args.object as DTO;
          const [otherProp] = args.constraints as (string & keyof DTO)[];
          const otherProperty = target[otherProp];
          return value !== otherProperty;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must not equal ${args.constraints[0] as string}`;
        },
      },
    });
  };
}
