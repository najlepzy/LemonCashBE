import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let executionContext: Partial<ExecutionContext>;
  let callHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    executionContext = {
      switchToHttp: () =>
        ({
          getRequest: () => ({ url: '/auth/register' }),
          getResponse: () => ({}),
          getNext: () => ({}),
        }) as any,
    };

    callHandler = {
      handle: () =>
        of({
          message: 'User registered successfully',
          user: { password: 'secret' },
          data: { id: 1 },
        }),
    };
  });

  it('should remove the password property and adjust the message', (done) => {
    interceptor
      .intercept(
        executionContext as ExecutionContext,
        callHandler as CallHandler,
      )
      .subscribe((response) => {
        expect(response.message).toBe('User registered successfully');
        expect(response.data).toEqual({ id: 1 });
        expect(response.data.password).toBeUndefined();
        done();
      });
  });
});