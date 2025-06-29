import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ nullable: true, type: 'text' })
    description?: string;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'createdById' }) 
    createdBy: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}

