import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { CreateTaskDto } from './dto/createTaskDto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { PrismaService } from '@prisma/prisma.service';
import { CollaboratorsService } from '@modules/collaborators/collaborators.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private collaboratorsService: CollaboratorsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createTask(userId: number, createTaskDto: CreateTaskDto) {
    const { title, description } = createTaskDto;
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        status: 'TODO',
        uuid: userId,
      },
    });

    this.notificationsGateway.server.emit('task-created', {
      ...task,
      completed: task.status === 'DONE',
    });

    return {
      message: 'Task created successfully',
      data: task,
    };
  }

  async getTasks(ownerId?: number) {
    const whereClause = ownerId ? { uuid: ownerId } : {};
    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });
    return {
      message: 'Tasks retrieved successfully',
      data: tasks,
    };
  }

  async updateTask(
    userId: number,
    taskId: number,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.uuid !== userId) {
      const isCollaborator = await this.collaboratorsService.isCollaborator(
        task.uuid,
        userId,
      );
      if (!isCollaborator) {
        throw new ForbiddenException('Not authorized to update this task');
      }

      if (updateTaskDto.title || updateTaskDto.description) {
        throw new ForbiddenException(
          'Collaborators can only update the task status',
        );
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { ...updateTaskDto },
    });

    this.notificationsGateway.server.emit('task-updated', updatedTask);

    return {
      message: 'Task updated successfully',
      data: updatedTask,
    };
  }

  async deleteTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.uuid !== userId) {
      throw new ForbiddenException('Not authorized to delete this task');
    }
    const deletedTask = await this.prisma.task.delete({
      where: { id: taskId },
    });

    this.notificationsGateway.server.emit('task-deleted', {
      id: deletedTask.id,
    });

    return {
      message: 'Task deleted successfully',
      data: deletedTask,
    };
  }
}
