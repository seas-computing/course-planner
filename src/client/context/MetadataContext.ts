import { createContext } from 'react';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { CampusResponse } from 'common/dto/room/CampusResponse.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';

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

  get catalogPrefixes(): string[] {
    return this.value.catalogPrefixes;
  }

  updateCampuses(room: RoomAdminResponse): void {
    const { campuses } = this.value;
    // Finds the campus that the new building will be in so that we can
    // add the building to that campus' list of buildings
    const updatedCampusIndex: number = campuses
      .findIndex((campus) => campus.name === room.building.campus.name);
    campuses[updatedCampusIndex].buildings.push({
      id: room.building.id,
      name: room.building.name,
      rooms: [
        {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
        },
      ],
    });
    // Sort the buildings within the campus in alphabetical order ascending
    campuses[updatedCampusIndex].buildings.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    this.update({
      ...this.value,
      campuses,
    });
  }

  get campuses(): CampusResponse[] {
    return this.value.campuses;
  }
}

/**
 * Manage the current metadata through Context
 */
export const MetadataContext = createContext<MetadataContextValue>(null);
