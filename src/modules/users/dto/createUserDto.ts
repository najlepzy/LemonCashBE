import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const CreateUserSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.string().email({ message: 'Email must be valid' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message:
        'Password must include at least one number, one lowercase letter, one uppercase letter, and one special character',
    }),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
  static schema = CreateUserSchema;
}
