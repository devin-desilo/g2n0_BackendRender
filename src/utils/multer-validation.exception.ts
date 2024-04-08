// multer-validation.exception.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { errorResponse } from '@src/auth/common.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('first  ', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception?.getStatus();

    if (status === 400) {
      const responses = exception.getResponse();
      const messages: any = responses;
      console.log(responses);
      response
        .status(422)
        .json(
          errorResponse(
            messages.message?.length > 0 ? messages.message[0] : '',
            422,
            messages.message,
          ),
        );
    } else {
      response.status(status).json(exception.getResponse());
    }
  }
}
