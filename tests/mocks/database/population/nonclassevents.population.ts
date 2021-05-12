import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Semester } from 'server/semester/semester.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { Area } from 'server/area/area.entity';
import { BasePopulationService } from './base.population';
import { NonClassMeetingData } from './data';
import { Room } from '../../../../src/server/location/room.entity';

export class NonClassEventPopulationService
  extends BasePopulationService<NonClassParent> {
  @InjectRepository(NonClassParent)
  protected parentRepository: Repository<NonClassParent>;

  @InjectRepository(NonClassEvent)
  protected eventRepository: Repository<NonClassEvent>;

  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  @InjectRepository(Meeting)
  protected meetingRepository: Repository<Meeting>;

  @InjectRepository(Room)
  protected roomRepository: Repository<Room>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  public async populate({
    nonClassMeetings,
  }: { nonClassMeetings: NonClassMeetingData[] }): Promise<NonClassParent[]> {
    const allSemesters = await this.semesterRepository.find({
      order: {
        academicYear: 'ASC',
        term: 'ASC',
      },
    });

    const allRooms = await this.roomRepository.find(
      {
        order: {
          name: 'ASC',
        },
        relations: ['building'],
      }
    );

    const area = await this.areaRepository.findOne();

    return this.parentRepository.save(
      nonClassMeetings.map((parentData) => {
        const nonClassParent = new NonClassParent();
        nonClassParent.title = parentData.title;
        nonClassParent.contactName = parentData.contactName;
        nonClassParent.contactEmail = parentData.contactEmail;
        nonClassParent.contactPhone = parentData.contactPhone;
        nonClassParent.expectedSize = parentData.expectedSize;
        nonClassParent.area = area;
        nonClassParent.nonClassEvents = allSemesters
          .map((sem): NonClassEvent => {
            const nonClassEvent = new NonClassEvent();
            nonClassEvent.private = parentData.private;
            nonClassEvent.semester = sem;
            nonClassEvent.meetings = parentData.meetings
              .map((meetingData): Meeting => {
                const meeting = new Meeting();
                meeting.day = meetingData.day;
                meeting.startTime = meetingData.startTime;
                meeting.endTime = meetingData.endTime;
                meeting.room = allRooms.find(
                  ({ name, building }): boolean => (
                    `${building.name} ${name}` === meetingData.room
                  )
                );
                return meeting;
              });
            return nonClassEvent;
          });
        return nonClassParent;
      })
    );
  }

  public async drop(): Promise<void> {
    // Using code found here: https://github.com/typeorm/typeorm/issues/5934#issuecomment-618334924
    // to get the table name dynamically, since the spacing/casing is a little weird
    const nonClassEvent = this.eventRepository.metadata.tableName;
    const nonClassParent = this.parentRepository.metadata.tableName;
    await this.eventRepository.query(`TRUNCATE TABLE "${nonClassEvent}", "${nonClassParent}" CASCADE;`);
  }
}
