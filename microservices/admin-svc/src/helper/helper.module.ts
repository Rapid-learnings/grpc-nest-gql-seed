import { Module } from '@nestjs/common';
import { ResponseHandlerService } from './response-handler.service';
@Module({
  providers: [ResponseHandlerService],
  exports: [ResponseHandlerService],
})
export class HelperModule {}
