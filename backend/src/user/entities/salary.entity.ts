// salary.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
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

  @CreateDateColumn()
  generatedAt: Date;

  @Column({ nullable: true })
stripeTransactionId: string;

}
