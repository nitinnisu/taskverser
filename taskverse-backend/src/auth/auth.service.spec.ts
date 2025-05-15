import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.schema';
import { ConfigService } from '@nestjs/config';

// Mock UsersService
const mockUsersService = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') {
      return 'testSecret'; // Provide a test secret
    }
    return undefined;
  }),
};

// Mock bcrypt
const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();

jest.mock('bcrypt', () => ({
  hash: (...args) => mockBcryptHash(...args),
  compare: (...args) => mockBcryptCompare(...args),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    const signupDto: SignupDto = { username: 'testuser', password: 'password123' };

    it('should throw BadRequestException if username already exists', async () => {
      mockUsersService.findByUsername.mockResolvedValueOnce({ username: 'testuser', passwordHash: 'someHash' } as User);
      await expect(authService.signup(signupDto)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should hash the password and create a new user', async () => {
      mockUsersService.findByUsername.mockResolvedValueOnce(null);
      mockBcryptHash.mockResolvedValueOnce('hashedPassword');
      mockUsersService.create.mockResolvedValueOnce({ _id: 'someId', username: 'testuser', passwordHash: 'hashedPassword' } as User);
      await authService.signup(signupDto);
      expect(mockBcryptHash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({ username: signupDto.username, passwordHash: 'hashedPassword' });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = { username: 'testuser', password: 'password123' };
    const mockUser: User = { _id: 'someId', username: 'testuser', passwordHash: 'hashedPassword' } as User;

    it('should return an access token if credentials are valid', async () => {
      mockUsersService.findByUsername.mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce('mockAccessToken');
      const result = await authService.login(loginDto.username, loginDto.password);
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'someId', username: 'testuser' }, { secret: 'testSecret', expiresIn: '1h' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValueOnce(null);
      await expect(authService.login(loginDto.username, loginDto.password)).rejects.toThrow(UnauthorizedException);
      expect(mockBcryptCompare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByUsername.mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(false);
      await expect(authService.login(loginDto.username, loginDto.password)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const mockUser: User = { _id: 'someId', username: 'testuser', passwordHash: 'someHash' } as User;
    const payload = { sub: 'someId', username: 'testuser' };

    it('should return user data if user exists', async () => {
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      const result = await authService.validateUser(payload);
      expect(result).toEqual({ userId: 'someId', username: 'testuser' });
      expect(usersService.findById).toHaveBeenCalledWith('someId');
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);
      const result = await authService.validateUser(payload);
      expect(result).toBeNull();
      expect(usersService.findById).toHaveBeenCalledWith('someId');
    });
  });
}); 