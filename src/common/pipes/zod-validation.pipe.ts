import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      // explicitly type as ZodError<unknown>
      const zErr: ZodError<unknown> = result.error;

      // ZodIssue has path and message
      const messages = zErr.issues.map((issue: ZodIssue) => {
        const path = issue.path.length ? issue.path.join('.') : 'body';
        return `${path} - ${issue.message}`;
      });

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }
    return result.data;
  }
}
