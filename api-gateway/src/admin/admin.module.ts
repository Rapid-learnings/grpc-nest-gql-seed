import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { UserModule } from '../user/user.module';
import { AdminResolver } from './admin.resolver';
import { AdminController } from './admin.controller';

@Module({
  imports: [HelperModule, UserModule],
  providers: [AdminResolver],
  exports: [AdminResolver],
  controllers: [AdminController],
})
export class AdminModule {}
