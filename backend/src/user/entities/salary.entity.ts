import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  baseAmount: number;

  @Column()
  bonusAmount: number;

  @Column()
  totalAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  stripeTransactionId: string;

  @CreateDateColumn()
  generatedAt: Date;
}