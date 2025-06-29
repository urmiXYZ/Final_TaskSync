// chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Conversation } from 'src/user/entities/conversation.entity';
import { Message } from 'src/user/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { ConversationParticipant } from 'src/user/entities/participants.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Project } from 'src/user/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, User, ConversationParticipant, Project]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ConversationController], 
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
