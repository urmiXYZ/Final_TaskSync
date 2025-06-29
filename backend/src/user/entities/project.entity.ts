import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { TeamMember } from './teamMembers.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'ownerId' })
owner: User | null;

@Column({ type: 'int', nullable: true })
ownerId: number | null;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.project)
teamMembers: TeamMember[];

@OneToMany(() => Conversation, conversation => conversation.project)
conversations: Conversation[];


}
