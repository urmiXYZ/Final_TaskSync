import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';


@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async submitFeedback(@Req() req, @Body() createFeedbackDto: CreateFeedbackDto) {
    const user = req.user;

    const feedbackData = {
      ...createFeedbackDto,
      name: user.name,
      email: user.email,
    };

    return this.feedbackService.create(feedbackData);
  }
}
