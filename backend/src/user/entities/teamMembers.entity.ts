import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Project } from './project.entity';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.teamMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { eager: true })  
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isLeader: boolean;
}
