import { Controller, Inject } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { Post, Body } from '@nestjs/common';
import { CreateEventDto } from 'src/scheduler/dto/scheduler.dto';

@Controller('scheduler')
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}
  // to create a new event

  @Post('create-event')
  async createEvent(@Body() dto: CreateEventDto) {
    try {
      console.log(dto);
      return await this.schedulerService.createEvent(dto);
    } catch (err) {
      console.log(err);
    }
  }
}
