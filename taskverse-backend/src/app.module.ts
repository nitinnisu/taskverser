  import { Module } from '@nestjs/common';
  import { AppController } from './app.controller';
  import { AppService } from './app.service';
  import { TasksModule } from './tasks/tasks.module';
  import { MongooseModule } from '@nestjs/mongoose';
  import { HealthModule } from './health/health.module';
  import { UsersModule } from './users/users.module'; // Import UsersModule
  import { AuthModule } from './auth/auth.module';   // Import AuthModule
  import { ConfigModule } from '@nestjs/config';

  @Module({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env',
        isGlobal: true,
      }),
      TasksModule,
      UsersModule,
      AuthModule,
      MongooseModule.forRoot('mongodb+srv://nitin499533:2gBWAUmw7fXw1FgN@cluster0.5sa1ale.mongodb.net/taskVerser?retryWrites=true&w=majority'), // Use environment variable for connection string
      HealthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}

  // mongodb+srv://nitin499533:2gBWAUmw7fXw1FgN@cluster0.5sa1ale.mongodb.net/taskVerser?retryWrites=true&w=majority