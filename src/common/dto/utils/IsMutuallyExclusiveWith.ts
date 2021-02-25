import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  getFromContainer,
  MetadataStorage,
  ValidationTypes,
} from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { ValidationMetadataArgs } from 'class-validator/metadata/ValidationMetadataArgs';

/**
 * Validator to confirm that only one from a set of fields exists in a DTO.
 * Exactly one of the fields in the set must be included.
 * Any additional validators on the undefined fields will be ignored, so you
 * can stack additional decorators (e.g. `@isUUID`) on each field and they will
 * only run on the one field that is defined.
 *
 * For examples, a [[Meeting]] can belong to a [[CourseInstance]] or a
 * [[NonClassEvent]], but not both. So when we send a request to create/edit a
 * meeting, we need to confirm that a value for exactly one those fields is
 * provided.
 */
export default function IsMutuallyExclusiveWith<DTO>(
  properties: (string & keyof DTO)[],
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function IsMutuallyExclusiveWithValidator(
    object: DTO,
    propertyName: string & keyof DTO
  ): void {
    /*
     * This is not really documented in class-validator, but I've borrowed the
     * code for [the @IsOptional decorator][1] and added a small to tweak to
     * only ignore when this particular field is not the only field defined.
     * That way, the validators will run if:
     *
     * 1. None of the fields are defined
     * 2. More than one field is defined
     * 3. Only this particular field is defined
     *
     * [1]: (https://github.com/typestack/class-validator/blob/v0.11.1/src/decorator/decorators.ts#L229-L241)
     */
    const optionalArgs: ValidationMetadataArgs = {
      type: ValidationTypes.CONDITIONAL_VALIDATION,
      target: object.constructor,
      propertyName,
      constraints: [
        (target: DTO): boolean => {
          const onlyOnePropDefined = [propertyName, ...properties]
            .filter((prop) => (
              target[prop] !== null && target[prop] !== undefined))
            .length === 1;
          const thisPropDefined = (target[propertyName] !== null
            && target[propertyName] !== undefined);
          return !onlyOnePropDefined || thisPropDefined;
        },
      ],
      validationOptions,
    };
    getFromContainer(MetadataStorage)
      .addValidationMetadata(new ValidationMetadata(optionalArgs));
    registerDecorator({
      name: 'isMutuallyExclusiveWith',
      target: object.constructor,
      propertyName,
      constraints: [...properties],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const target = args.object as DTO;
          const thisPropDefined = (value !== undefined && value !== null);
          const otherDefinedProps = properties.filter((prop) => (
            target[prop] !== undefined && target[prop] !== null));
          const noOtherPropsDefined = otherDefinedProps.length === 0;
          return thisPropDefined && noOtherPropsDefined;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} is mutually exclusive with: ${args.constraints.join(', ')}`;
        },
      },
    });
  };
}
