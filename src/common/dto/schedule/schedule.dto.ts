import { DAY } from 'server/entities';

/**
 * The following is an example of a response that may be returned from the server:
* {
*   "meetings": [
*     {
*       "id": "c7b1fa3f-c5b0-478d-a29c-7f85a4d80109",
*       "startTime": {
*         "hour": 14,
*         "minute": 30
*       },
*       "endTime": {
*         "hour": 16,
*         "minute": 0
*       },
*       "weekday": "TUE",
*       "location": {
*         "campus": {
*           "id": "ma12e1in",
*           "name": "Cambridge"
*         },
*         "building": {
*           "id": "asdajna",
*           "name": "Maxwell Dworkin"
*         },
*         "room": {
*           "id": "121mkasda",
*           "name": "203"
*         }
*       },
*       "course": {
*         "area": {
*           "id": "sadf2fa3f-c5b0-478d-a29c-7f85a4dasd",
*           "name": "ACS"
*         },
*         "prefix": "AC",
*         "number": "209"
*       }
*     }
*   ]
* }
*/

export abstract class ScheduleViewResponseDTO {
  public startTime: {
    hour: number;
    minute: number;
  };

  public endTime: {
    hour: number;
    minute: number;
  };

  public duration: number;

  public weekday: DAY;

  public location: {
    campus: {
      id: string;
      name: string;
    };
    building: {
      id: string;
      name: string;
    };
    room: {
      id: string;
      name: string;
    };
  }

  public course: {
    area: {
      id: string;
      name: string;
    };
    prefix: string;
    number: string;
  };
}
