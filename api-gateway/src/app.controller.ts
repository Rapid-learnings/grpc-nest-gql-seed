import { Controller, Get } from '@nestjs/common';
/**
 * @category Core
 */
@Controller('')
export class AppController {
  @Get('')
  async hello() {
    return 'Hello World!';
  }
}
