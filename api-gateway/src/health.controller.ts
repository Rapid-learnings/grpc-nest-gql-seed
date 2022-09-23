import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';

/**
 * HealthController is responsible for handling health check requests. It is used with @nestjs/terminus to check if the app is running or not.
 * It creates a route - "/health"
 * @category Core
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  /**
   * Get API - "/" - performs  defined health checks and returns the result.
   * @returns returns the result of each check in an array.
   */
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    try {
      return await this.health.check([
        () =>
          this.http.pingCheck(
            'api-gateway app',
            'http://localhost:7000/api/v1/',
          ),
        () =>
          this.http.pingCheck(
            'admin app',
            'http://localhost:7000/api/v1/admin/health',
          ),
        () =>
          this.http.pingCheck(
            'wallet app',
            'http://localhost:7000/api/v1/wallet/health',
          ),
        () =>
          this.http.pingCheck(
            'collection app',
            'http://localhost:7000/api/v1/collection/health',
          ),
        () =>
          this.http.pingCheck(
            'user app',
            'http://localhost:7000/api/v1/user/health',
          ),
        () =>
          this.http.pingCheck(
            'bidding app',
            'http://localhost:7000/api/v1/bidding/health',
          ),
      ]);
    } catch (e) {
      console.log(e);
      return e.response;
    }
  }
}
