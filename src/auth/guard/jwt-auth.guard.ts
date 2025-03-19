import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // isPublic is metadata that is attached to data
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }


    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // get request's method, path
        const request: Request = context.switchToHttp().getRequest();
        const targetMethod = request.method;
        const targetPath = request.route?.path as string;

        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException("Token is expired or don't have token in header");
        }

        // check permissions
        const permissions = user?.permissions ?? [];
        let enablePermission = permissions.find(permission =>
            permission.apiPath === targetPath
            &&
            permission.method === targetMethod
        )
        if (targetPath.startsWith('/api/v1/auth')) enablePermission = true;
        if (!enablePermission) {
            throw new ForbiddenException('You do not have permission to access this page');
        }
        return user;
    }
}
