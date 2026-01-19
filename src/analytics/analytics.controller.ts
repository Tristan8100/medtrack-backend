import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // @Get()
  // getHello() {
  //   return this.analyticsService.hello();
  // }

  @Get()
  getSummary() {
    return this.analyticsService.getDashboardSummary();
  }


}
