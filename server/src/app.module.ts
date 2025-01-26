import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONOGO_DB_URI: Joi.string().required(),
        PORT: Joi.number().port().default(3000),
      }),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
