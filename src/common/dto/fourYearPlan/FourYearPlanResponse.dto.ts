import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN } from 'common/constants';
import { string } from 'testData';

abstract class Faculty {
  @ApiModelProperty({
    type: string,
    example: 'Kozinsky',
  })
  public lastName: string;

  @ApiModelProperty({
    type: string,
    example: 'Bonnie',
  })
  public firstName: string;
}

abstract class CourseInstance {
  @ApiModelProperty({
    type: 'string',
    example: 'fc772fd6-651e-40c3-97e6-b815818120ce',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'AP',
  })
  public area: string;

  @ApiModelProperty({
    type: 'string',
    example: 'AP 291',
  })
  public catalogNumber: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Electron Microscopy Laboratory',
  })
  public title: string;

  @ApiModelProperty({
    isArray: true,
    type: Faculty,
  })
  public faculty: Faculty[];
}

abstract class Semester {
  @ApiModelProperty({
    type: 'number',
    example: 2011,
  })
  public academicYear: number;

  @ApiModelProperty({
    type: 'string',
    example: TERM_PATTERN.FALL,
  })
  public term: TERM_PATTERN;

  @ApiModelProperty({
    isArray: true,
    type: CourseInstance,
  })
  public courseInstances: CourseInstance[];
}

export abstract class FourYearPlanResponseDTO {
  @ApiModelProperty({
    example: [
      {
        academicYear: 2011,
        term: TERM_PATTERN.FALL,
        courseInstances: [
          {
            id: 'fc772fd6-651e-40c3-97e6-b815818120ce',
            area: 'AP',
            catalogNumber: 'AP 291',
            title: 'Electron Microscopy Laboratory',
            faculty: [
              {
                lastName: 'Wilson',
                firstName: 'Kendra',
              },
              {
                lastName: 'Michaelson',
                firstName: 'John',
              },
            ],
          },
        ],
      },
    ],
    type: Semester,
    isArray: true,
  })
  public semesters: Semester[];
}
