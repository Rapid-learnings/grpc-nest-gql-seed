import { Module } from '@nestjs/common';
import { ResponseHandlerService } from './response-handler.service';

/**
 * It is a Helper module where we keep the service and other code related to helper functionalities for other modules.
 * @category Helper
 */ @Module({
  providers: [ResponseHandlerService],
  exports: [ResponseHandlerService],
})
export class HelperModule {}
