import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { COURSE_TABLE_COLUMN } from 'common/constants';

/**
 * Create View DTO
 *
 * Defines the data shape for creating a new [[View]] entry in the database.
 */
export class CreateViewDTO {
  /**
   * User EPPN
   * A user's EPPN is _NOT_ an email address. However according to internet2
   * documentation, it appears to follow the same format - so despite not being
   * an email address, we can use an email validator(with a custom message) to
   * validate it
   * @see https://spaces.at.internet2.edu/display/InCFederation/2014/08/24/Asserting+ePPN+Across+the+Gateway
   */
  @IsEmail(undefined, {
    message: '$value is an invalid EPPN',
  })
  @ApiProperty({
    example: '4A2849CF119852@harvard.edu',
    description: 'User EPPN',
    externalDocs: {
      url: 'https://spaces.at.internet2.edu/display/federation/user-attr-eppn',
      description: 'Internet2 EPPN documentation',
    },
  })
  public eppn: string;

  @ApiProperty({
    description: 'Array of column names for this view',
    example: COURSE_TABLE_COLUMN.AREA,
    enum: COURSE_TABLE_COLUMN,
  })
  @IsEnum(COURSE_TABLE_COLUMN, { each: true })
  public columns: COURSE_TABLE_COLUMN[] = [];

  @ApiProperty({
    example: 'No semester data',
    description: 'A descriptive name for this custom view',
  })
  @IsString()
  @MinLength(1)
  public name: string;
}
