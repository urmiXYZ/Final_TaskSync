import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Message } from './message.entity';
import { ConversationParticipant } from './participants.entity';
import { PersonalTask } from './personal-task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, role => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
    @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];
 
  @OneToMany(() => ConversationParticipant, participant => participant.user)
  conversationParticipants: ConversationParticipant[];

  @Column({ type: 'boolean', nullable: true })
isDisabled: boolean | null;

@OneToMany(() => PersonalTask, (task) => task.user)
  personalTasks: PersonalTask[];
}
