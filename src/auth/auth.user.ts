import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ROLE_KEY = 'role';
export const Role = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private userService: UsersService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user; // already set by AuthGuard

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const userId = user.sub || user.id;
        const val = await this.userService.findOne(userId); //change to sub, idk

        if (!val) {
            throw new UnauthorizedException('User not found');
        }

        if (requiredRoles && !requiredRoles.includes(val.role)) {
            console.log('Access denied');
            throw new ForbiddenException('Access denied');
        }

        return true;
    }
}
