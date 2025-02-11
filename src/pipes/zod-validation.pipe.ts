import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype && (metadata.metatype as any).schema) {
      const schema = (metadata.metatype as any).schema;
      const result = schema.safeParse(value);
      if (!result.success) {
        const errorMessages = result.error.errors
          .map((err) => err.message)
          .join(', ');
        throw new BadRequestException(errorMessages);
      }
      return result.data;
    }
    return value;
  }
}
