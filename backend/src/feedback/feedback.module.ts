import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { EmailModule } from '../email/email.module';
import { FeedbackController } from './feedback.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [EmailModule, AuthModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
