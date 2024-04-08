import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { nanoid } from 'nanoid';

export interface RequestIdConfig {
  header: string;
  idGenerator: () => string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private header: string;
  private idGenerator: () => string;

  constructor() {
    this.header = 'x-request-id';
    this.idGenerator = nanoid;
  }

  use(request: Request, response: Response, next: NextFunction) {
    const requestIdHeader = request.header(this.header) || this.idGenerator();
    request.id = requestIdHeader;
    request.headers[this.header] = requestIdHeader;
    response.set(this.header, requestIdHeader);
    next();
  }
}
