import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { UserModule } from '../user/user.module';
import { AdminResolver } from './admin.resolver';
import { AdminController } from './admin.controller';
import { Admin2Service } from './admin2.service';

@Module({
  imports: [HelperModule, UserModule],
  providers: [AdminResolver, Admin2Service],
  exports: [AdminResolver, Admin2Service],
  controllers: [AdminController],
})
export class AdminModule {}
