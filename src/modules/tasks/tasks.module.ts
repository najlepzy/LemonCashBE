import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { CollaboratorsModule } from '@modules/collaborators/collaborators.module';
import { NotificationsModule } from '@notifications/notifications.module';
import { TasksController } from './task.controller';




@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CollaboratorsModule,
    NotificationsModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
