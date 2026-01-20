import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role, RolesGuard } from 'src/auth/auth.user';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // @Get()
  // getHello() {
  //   return this.analyticsService.hello();
  // }

  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Role('staff', 'admin')
  @Get()
  getSummary() {
    return this.analyticsService.getDashboardSummary();
  }


}
