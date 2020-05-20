/**
 * Metadata Response
 *
 * Represents the format of metadata returned by the server in response to
 * API requests for metadata (i.e: getting the academic year, semesters, areas, etc.)
 */

import { ApiModelProperty } from '@nestjs/swagger';

export abstract class MetadataResponse {
  @ApiModelProperty({
    type: 'number',
    example: 2012,
  })
  public academicYear: number;

  @ApiModelProperty({
    type: 'string',
    example: 'AP',
    isArray: true,
  })
  public areas: string[];

  @ApiModelProperty({
    type: 'string',
    example: 'Fall 2012',
    isArray: true,
  })
  public semesters: string[];
}
