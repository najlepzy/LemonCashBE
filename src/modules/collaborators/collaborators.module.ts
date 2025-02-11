import { Module } from '@nestjs/common';
import { NotificationsModule } from '@notifications/notifications.module';
import { UsersModule } from '@modules/users/users.module';
import { PrismaModule } from '@prisma/prisma.module';
import { CollaboratorsService } from './collaborators.service';
import { CollaboratorsController } from './collaborators.controller';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule],
  providers: [CollaboratorsService],
  controllers: [CollaboratorsController],
  exports: [CollaboratorsService],
})
export class CollaboratorsModule {}
