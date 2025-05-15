// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), // Use getOrThrow
    });
    console.log('*** JwtStrategy - constructor ***');
    console.log('JWT Secret Key (from config):', this.configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any): Promise<{ userId: string; username: string } | null> {
    console.log('*** JwtStrategy - validate ***');
    console.log('Payload received:', payload);
    const user = await this.usersService.findById(payload.sub);
    if (user) {
      console.log('User found in database:', user);
      return { userId: user._id.toString(), username: user.username };
    }
    console.log('User not found');
    return null;
  }
}