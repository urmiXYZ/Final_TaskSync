import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('request_users')
export class RequestUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;  
}
