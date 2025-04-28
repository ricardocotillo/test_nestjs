import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
