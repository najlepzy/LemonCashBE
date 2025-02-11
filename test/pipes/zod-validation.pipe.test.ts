import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from '@pipes/zod-validation.pipe';
import { z } from 'zod';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe();
  });

  it('should return the value if no schema is defined', () => {
    const value = { foo: 'bar' };
    const result = pipe.transform(value, {
      metatype: undefined,
      type: 'body',
      data: '',
    });
    expect(result).toEqual(value);
  });

  it('should validate and return the data if it is valid', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int().positive(),
    });
    class DummyDto {}
    (DummyDto as any).schema = schema;

    const validData = { name: 'Lauta', age: 30 };
    const result = pipe.transform(validData, {
      metatype: DummyDto,
      type: 'body',
      data: '',
    });
    expect(result).toEqual(validData);
  });

  it('should throw BadRequestException if the data is invalid', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int().positive(),
    });
    class DummyDto {}
    (DummyDto as any).schema = schema;

    const invalidData = { name: 'Lauta', age: -5 };
    expect(() => {
      pipe.transform(invalidData, {
        metatype: DummyDto,
        type: 'body',
        data: '',
      });
    }).toThrow(BadRequestException);
  });
});