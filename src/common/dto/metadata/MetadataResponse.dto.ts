/**
 * Metadata Response
 *
 * Represents the format of metadata returned by the server in response to
 * API requests for metadata (i.e: getting the academic year, semesters, areas, etc.)
 */

import { ApiProperty } from '@nestjs/swagger';

export abstract class MetadataResponse {
  @ApiProperty({
    type: 'number',
    example: 2012,
  })
  public currentAcademicYear: number;

  @ApiProperty({
    type: 'string',
    example: ['AP', 'CS'],
    isArray: true,
  })
  public areas: string[];

  @ApiProperty({
    type: 'string',
    example: ['Fall 2012', 'Spring 2013'],
    isArray: true,
  })
  public semesters: string[];

  @ApiProperty({
    type: 'string',
    example: ['AC', 'AP', 'BE'],
    isArray: true,
  })
  public catalogPrefixes: string[];
}
