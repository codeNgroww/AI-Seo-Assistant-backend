import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // In production, extract from verified JWT. In assessment demo, read x-user-role header or fallback to ADMIN
    const userRole = request.headers['x-user-role'] || 'ADMIN';

    if (userRole !== 'ADMIN' && userRole !== 'CONTENT_EDITOR') {
      throw new UnauthorizedException(
        `Role "${userRole}" is not authorized. This endpoint is strictly restricted to ADMIN or CONTENT_EDITOR.`
      );
    }

    request.user = {
      id: request.headers['x-user-id'] || 'admin_usr_01',
      name: request.headers['x-user-name'] || 'Space42 Admin',
      role: userRole
    };

    return true;
  }
}
