import { UpdateTaskDto } from '@modules/tasks/dto/updateTask.dto';
import { TasksService } from '@modules/tasks/tasks.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let tasksService: TasksService;
  let prisma: any;
  let collaboratorsService: any;
  let notificationsGateway: any;

  beforeEach(() => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    collaboratorsService = {
      isCollaborator: jest.fn(),
    };

    notificationsGateway = {
      server: {
        emit: jest.fn(),
      },
    };

    tasksService = new TasksService(
      prisma,
      collaboratorsService,
      notificationsGateway,
    );
  });

  describe('createTask', () => {
    it('should create a task and emit event', async () => {
      const createTaskDto = { title: 'Test Task', description: 'Desc' };
      const fakeTask = {
        id: 1,
        title: 'Test Task',
        description: 'Desc',
        status: 'TODO',
        uuid: 123,
      };
      prisma.task.create.mockResolvedValue(fakeTask);

      const result = await tasksService.createTask(123, createTaskDto);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: 'Desc',
          status: 'TODO',
          uuid: 123,
        },
      });
      expect(notificationsGateway.server.emit).toHaveBeenCalledWith(
        'task-created',
        {
          ...fakeTask,
          completed: fakeTask.status === 'DONE',
        },
      );
      expect(result).toEqual({
        message: 'Task created successfully',
        data: fakeTask,
      });
    });
  });

  describe('getTasks', () => {
    it('should retrieve tasks ordered by createdAt', async () => {
      const tasksArray = [{ id: 1 }, { id: 2 }];
      prisma.task.findMany.mockResolvedValue(tasksArray);
      const result = await tasksService.getTasks(123);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { uuid: 123 },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual({
        message: 'Tasks retrieved successfully',
        data: tasksArray,
      });
    });
  });

  describe('updateTask', () => {
    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(
        tasksService.updateTask(123, 1, { status: 'DONE' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner and not collaborator', async () => {
      const fakeTask = { id: 1, uuid: 111, status: 'TODO' };
      prisma.task.findUnique.mockResolvedValue(fakeTask);
      collaboratorsService.isCollaborator.mockResolvedValue(false);
      await expect(
        tasksService.updateTask(123, 1, { status: 'DONE', title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update task if user is owner', async () => {
      const fakeTask = { id: 1, uuid: 123, status: 'TODO' };
      prisma.task.findUnique.mockResolvedValue(fakeTask);
      const updateData = { status: 'DONE' } as UpdateTaskDto;
      const updatedTask = { id: 1, uuid: 123, status: 'DONE' };
      prisma.task.update.mockResolvedValue(updatedTask);
      const result = await tasksService.updateTask(123, 1, updateData);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(notificationsGateway.server.emit).toHaveBeenCalledWith(
        'task-updated',
        updatedTask,
      );
      expect(result).toEqual({
        message: 'Task updated successfully',
        data: updatedTask,
      });
    });
  });

  describe('deleteTask', () => {
    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(tasksService.deleteTask(123, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const fakeTask = { id: 1, uuid: 111 };
      prisma.task.findUnique.mockResolvedValue(fakeTask);
      await expect(tasksService.deleteTask(123, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete task if user is owner', async () => {
      const fakeTask = { id: 1, uuid: 123 };
      prisma.task.findUnique.mockResolvedValue(fakeTask);
      prisma.task.delete.mockResolvedValue(fakeTask);
      const result = await tasksService.deleteTask(123, 1);
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(notificationsGateway.server.emit).toHaveBeenCalledWith(
        'task-deleted',
        { id: fakeTask.id },
      );
      expect(result).toEqual({
        message: 'Task deleted successfully',
        data: fakeTask,
      });
    });
  });
});