// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('*** JwtAuthGuard - canActivate ***');
    const request = context.switchToHttp().getRequest();
    console.log('Authorization Header:', request.headers.authorization);
    const isAuthenticated = await super.canActivate(context) as boolean;
    console.log('JwtAuthGuard - isAuthenticated:', isAuthenticated); // Add this line
    return isAuthenticated;
  }

  handleRequest(err, user, info) {
    console.log('*** JwtAuthGuard - handleRequest ***');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}