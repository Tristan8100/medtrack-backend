import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Override the default tracking logic
  protected async getTracker(req: Record<string, any>): Promise<string> {

    const ip = req.ip ?? "NULL";
    const userAgent = req.headers['user-agent'] ?? "NULL";
    console.log(`${ip}-${userAgent}`);

    return `${ip}-${userAgent}`;
  }


  // Customize the rate-limit based on user roles
//   protected getLimit(context: ExecutionContext): number {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     if (user?.role === 'admin') {
//       return 10; // Admins can make 10 requests in the TTL window
//     } else {
//       return 5; // Regular users get 5 requests
//     }
//   }

  // Set a global time-to-live of 60 seconds for all requests
  protected getTTL(context: ExecutionContext): number {
    return 60; 
  }
}
