import { Controller, Inject } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { MessagePattern } from '@nestjs/microservices';
import { Req, Get, Post, Body } from '@nestjs/common';

@Controller('scheduler')
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}
  // to create a new event
  @Post('create-event')
  async createEvent(@Body() dto) {
    try {
      console.log(dto);
      return await this.schedulerService.createEvent(dto);
    } catch (err) {
      console.log(err);
    }
  }
}
