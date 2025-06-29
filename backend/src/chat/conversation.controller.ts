import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConversationService } from './conversation.service';

@Controller('projects/:projectId/chat')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getConversationAndMessages(
    @Param('projectId') projectId: number,
    @Req() req,
  ) {
    const conversation = await this.conversationService.getOrCreateProjectConversation(projectId);

    // Mark as read for current user
    await this.conversationService.markAsRead(conversation.id, req.user.id);

    const messages = await this.conversationService.getMessages(conversation.id);
     console.log('✅ Messages being sent to frontend:', messages);
    return { conversationId: conversation.id, messages };
  }

  @Post('message')
  async sendMessage(
    @Param('projectId') projectId: number,
    @Body('content') content: string,
    @Req() req,
  ) {
    const conversation = await this.conversationService.getOrCreateProjectConversation(projectId);
    const message = await this.conversationService.sendMessage(conversation.id, req.user.id, content);
    return message;
  }
}