import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { ConversationParticipant } from './participants.entity';
import { Project } from './project.entity';

 
@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;
 
  @Column({ type: 'varchar', default: 'direct' })
  type: string;
 
  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
 
  @OneToMany(() => ConversationParticipant, participant => participant.conversation)
  participants: ConversationParticipant[];
 
  @CreateDateColumn()
  createdAt: Date;
 
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.conversations, { onDelete: 'CASCADE' })
project?: Project;

@Column({ nullable: true })
projectId?: number;

}
 
 
 