import { Injectable, NestMiddleware, Inject, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

/**
 * LoggerMiddleware add logs for each incoming request
 * @category Core
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  use(req: Request, res: Response, next: () => void): void {
    this.logger.log(
      "info",
      `IP:${req.ip} called route ${req.url} with method ${
        req.method
      } with payload ${JSON.stringify(req.body)}`
    );
    next();
  }
}
