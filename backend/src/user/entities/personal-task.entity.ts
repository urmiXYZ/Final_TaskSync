import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PersonalTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date' })
  dueDate: string; // store as 'YYYY-MM-DD'

  @Column({ type: 'time', nullable: true })
  time?: string; // optional time as string e.g. '14:30'

  @ManyToOne(() => User, user => user.personalTasks, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
