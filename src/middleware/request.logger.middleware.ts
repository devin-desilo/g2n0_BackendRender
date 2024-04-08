import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { id, ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    response.on('finish', () => {
      const durationInMilliseconds = Date.now() - start;

      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `${chalk.blueBright(process.pid)} ${chalk.magenta.bold(
          id,
        )} ${chalk.cyanBright(ip)} ${method} ${originalUrl} HTTP/${
          request.httpVersion
        } ${statusCode} ${contentLength} - ${userAgent}: ` +
          chalk.yellow(durationInMilliseconds.toLocaleString() + ' ms'),
      );
    });

    next();
  }
}
