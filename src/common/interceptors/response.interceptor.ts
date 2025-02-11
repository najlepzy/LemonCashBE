import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.user && data.user.password) {
          delete data.user.password;
        }

        const request = context.switchToHttp().getRequest();
        let message =
          data && data.message ? data.message : 'Operation successful';

        if (request.url.includes('/auth/register')) {
          message =
            data && data.message
              ? data.message
              : 'User registered successfully';
        } else if (request.url.includes('/auth/login')) {
          message =
            data && data.message ? data.message : 'User logged in successfully';
        }

        const responseData = data && data.data !== undefined ? data.data : data;

        return { message, data: responseData };
      }),
    );
  }
}
