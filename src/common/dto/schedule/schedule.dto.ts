import { DAY } from '../../constants/constants';

/**
 * The following is an example of a response that may be returned from the server:
* {
*   "meetings": [
*     {
*       "startTime": {
*         "hour": 14,
*         "minute": 30
*       },
*       "endTime": {
*         "hour": 16,
*         "minute": 0
*       },
*       "duration": 90,
*       "weekday": "TUE",
*       "coursePrefix": "CS",
*       "courses": [
*         {
*           id: "c7b1fa3f-c5b0-478d-a29c-7f85a4d80109",
*           courseNumber: "209r",
*           campus: "Cambridge",
*           room: "Maxwell Dworkin 119",
*           isUndergraduate: true,
*         }
*       ]
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

  public coursePrefix: string;

  public courses: [
    {
      id: string;
      courseNumber: string;
      campus: string;
      room: string;
      isUndergraduate: boolean;
    }
  ]
}
