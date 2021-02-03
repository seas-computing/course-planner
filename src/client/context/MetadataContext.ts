import { createContext } from 'react';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

type MetadataUpdater = (metadata: MetadataResponse) => void;

/**
 * Provides functionality to access and update the values of the metadata.
 */
export class MetadataContextValue {
  private value: MetadataResponse;

  private update: MetadataUpdater;

  constructor(value: MetadataResponse, update: MetadataUpdater) {
    this.value = value;
    this.update = update;
  }

  updateAreas(area: string): void {
    const { areas } = this.value;
    this.update({
      ...this.value,
      areas: Array.from(new Set([...areas, area])).sort(),
    });
  }

  get areas(): string[] {
    return this.value.areas;
  }

  get currentAcademicYear(): number {
    return this.value.currentAcademicYear;
  }

  get semesters(): string[] {
    return this.value.semesters;
  }
}

/**
 * Manage the current metadata through Context
 */
export const MetadataContext = createContext<MetadataContextValue>(null);
