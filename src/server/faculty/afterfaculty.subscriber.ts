import { Absence } from 'server/absence/absence.entity';
import { Semester } from 'server/semester/semester.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Faculty } from './faculty.entity';

@EventSubscriber()
export class FacultySubscriber implements EntitySubscriberInterface<Faculty> {
  public listenTo(): typeof Faculty {
    return Faculty;
  }

  /**
   * Runs after _every_ faculty record insertion to populate absences for
   * faculty
   */
  public async afterInsert(
    { manager, entity: faculty }: InsertEvent<Faculty>
  ): Promise<void> {
    const absenceRepository = manager.getRepository(Absence);
    const semesterRepository = manager.getRepository(Semester);
    const allSemesters = await semesterRepository.find();
    const absences = allSemesters.map((semester) => absenceRepository.create({
      faculty,
      semester,
    }));
    await absenceRepository.save(absences);
  }
}
