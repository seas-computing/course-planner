import { Injectable } from '@nestjs/common';

/**
 * Service for providing data into the application
 */

@Injectable()
export class AppService {
  public getHello(): string {
    return 'Hello World!';
  }
}
