import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: 0 })
  budget!: number;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 0 })
  progress!: number;

  @Column({ default: 'active' })
  status!: string;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn()
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}