import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private emailService: EmailService) {}

  async create(dto: CreateFeedbackDto) {
    const previewUrl = await this.emailService.sendFeedbackEmail(
      dto.name,
      dto.email,
      dto.subject,
      dto.message
    );

    return {
      message: 'Feedback sent successfully!',
      previewUrl, // useful for testing with Ethereal
    };
  }
}
