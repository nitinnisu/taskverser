// src/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(userDto: { username: string; password: string }): Promise<User> {
    const { username, password } = userDto;
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new HttpException('Username already taken', HttpStatus.CONFLICT);
    }
    const passwordHash = await hash(password, 10);
    return this.usersService.create({ username, passwordHash });
  }

  async login(username: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await compare(pass, user.passwordHash))) {
      const payload = { sub: user._id, username: user.username };
      return {
        accessToken: this.jwtService.sign(payload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '1h', // You can adjust the expiration time
        }),
      };
    }
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  async validateUser(payload: any): Promise<{ userId: string; username: string } | null> {
    const user = await this.usersService.findById(payload.sub);
    if (user) {
      return { userId: payload.sub, username: user.username };
    }
    return null;
  }
}