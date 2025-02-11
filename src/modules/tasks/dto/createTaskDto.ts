import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const CreateTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
