import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
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
