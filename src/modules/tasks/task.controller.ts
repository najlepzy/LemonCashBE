import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CreateTaskDto } from './dto/createTaskDto';
import { UpdateTaskDto } from './dto/updateTask.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(@Req() req: Request, @Body() createTaskDto: CreateTaskDto) {
    const user = req.user as any;
    const userId = +user.sub;
    return await this.tasksService.createTask(userId, createTaskDto);
  }

  @Get()
  async findAll(@Query('ownerId') ownerId: string) {
    const ownerIdNumber = ownerId ? Number(ownerId) : undefined;
    return await this.tasksService.getTasks(ownerIdNumber);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const user = req.user as any;
    const userId = +user.sub;
    return await this.tasksService.updateTask(userId, id, updateTaskDto);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as any;
    const userId = +user.sub;
    return await this.tasksService.deleteTask(userId, id);
  }
}
