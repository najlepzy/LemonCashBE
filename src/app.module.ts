import { AuthModule } from '@modules/auth/auth.module';
import { CollaboratorsModule } from '@modules/collaborators/collaborators.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '@notifications/notifications.module';
import { PrismaModule } from '@prisma/prisma.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    CollaboratorsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
