import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redirect')
  redirectToFrontend(@Res() res: Response) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
}
