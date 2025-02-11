import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const UpdateTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
