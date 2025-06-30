import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('salary_payments')
export class SalaryPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  stripePaymentIntentId: string;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;
}