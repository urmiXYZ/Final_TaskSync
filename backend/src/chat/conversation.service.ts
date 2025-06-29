import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/user/entities/conversation.entity';
import { ConversationParticipant } from 'src/user/entities/participants.entity';
import { Message } from 'src/user/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/user/entities/project.entity';


@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  // 1. Get or create conversation for a project team chat
  async getOrCreateProjectConversation(projectId: number): Promise<Conversation> {
    let conversation = await this.conversationRepo.findOne({
      where: { projectId },
      relations: ['participants'],
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        projectId,
        type: 'group',
      });
      await this.conversationRepo.save(conversation);

      // Add all project team members + admin(s) as participants
const project = await this.projectRepo.findOne({
  where: { id: projectId },
  relations: ['teamMembers', 'teamMembers.user', 'owner'],
});
if (!project) throw new Error('Project not found');

// Extract users from teamMembers
const teamMemberUsers = (project.teamMembers || [])
  .map(tm => tm.user)
  .filter(Boolean);

// Combine with owner (admin/manager)
const participants: User[] = [...teamMemberUsers];
if (project.owner) participants.push(project.owner);

// Create ConversationParticipant entities
const participantEntities = participants.map(user =>
  this.participantRepo.create({
    conversationId: conversation!.id,  // safer than using full object
    userId: user.id,
    user,  // optional if you're using userId + want the relation to preload
  })
);
await this.participantRepo.save(participantEntities);

    }
    return conversation;
  }
// 2. Get messages for conversation
  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { timestamp: 'ASC' },
    });
  }

  // 3. Send message
  async sendMessage(conversationId: number, senderId: number, content: string): Promise<Message> {
  const message = this.messageRepo.create({
    conversation: { id: conversationId },
    sender: { id: senderId },
    content,
  });
  const saved = await this.messageRepo.save(message);
console.log('✅ Message sent:', message);
  // Re-fetch with sender relation included
  return this.messageRepo.findOneOrFail({
    where: { id: saved.id },
    relations: ['sender'],
  });
}


  // 4. Mark conversation as read by user
  async markAsRead(conversationId: number, userId: number): Promise<void> {
    const participant = await this.participantRepo.findOne({ where: { conversationId, userId } });
    if (participant) {
      participant.lastReadAt = new Date();
      await this.participantRepo.save(participant);
    }
  }
}