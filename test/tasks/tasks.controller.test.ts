import { TasksController } from '@modules/tasks/task.controller';
import { TasksService } from '@modules/tasks/tasks.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

describe('TasksController', () => {
  let controller: TasksController;
  let service: Partial<TasksService>;

  beforeEach(async () => {
    service = {
      createTask: jest.fn().mockResolvedValue({
        message: 'Task created successfully',
        data: { id: 1, title: 'Test Task' },
      }),
      getTasks: jest.fn().mockResolvedValue({
        message: 'Tasks retrieved successfully',
        data: [{ id: 1, title: 'Test Task' }],
      }),
      updateTask: jest.fn().mockResolvedValue({
        message: 'Task updated successfully',
        data: { id: 1, title: 'Updated Task' },
      }),
      deleteTask: jest.fn().mockResolvedValue({
        message: 'Task deleted successfully',
        data: { id: 1 },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should create a task', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const dto = { title: 'Test Task', description: 'Test Desc' };
    const result = await controller.create(req, dto);
    expect(service.createTask).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({
      message: 'Task created successfully',
      data: { id: 1, title: 'Test Task' },
    });
  });

  it('should get tasks', async () => {
    const result = await controller.findAll('1');
    expect(service.getTasks).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      message: 'Tasks retrieved successfully',
      data: [{ id: 1, title: 'Test Task' }],
    });
  });

  it('should update a task', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const updateDto = { title: 'Updated Task' };
    const result = await controller.update(req, 1, updateDto);
    expect(service.updateTask).toHaveBeenCalledWith(1, 1, updateDto);
    expect(result).toEqual({
      message: 'Task updated successfully',
      data: { id: 1, title: 'Updated Task' },
    });
  });

  it('should delete a task', async () => {
    const req = { user: { sub: '1' } } as unknown as Request;
    const result = await controller.delete(req, 1);
    expect(service.deleteTask).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({
      message: 'Task deleted successfully',
      data: { id: 1 },
    });
  });
});