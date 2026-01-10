import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ROLE_KEY = 'role';
export const Role = (role: string) => SetMetadata('role', role);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private userService: UsersService,
        private reflector: Reflector
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user; // already set by AuthGuard

        const requiredRole = this.reflector.getAllAndOverride<string>(
        ROLE_KEY,
        [context.getHandler(), context.getClass()],
        );
        

        console.log('User from AuthGuard:', user);

        if (!user) {
        throw new UnauthorizedException('User not found');
        }

        const val = await this.userService.findOne(user.id); //change to sub, idk

        if (!val) {
        throw new UnauthorizedException('User not foundSS');
        }

        if(requiredRole && val.role !== requiredRole) {
            console.log('Access denied');
            throw new ForbiddenException('Access denied');
        }

        return true;
    }
}
