import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Deadline } from '../../deadlines/entities/deadline.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  sender!: User;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'CASCADE' })
  task!: Task;

  @ManyToOne(() => Deadline, { nullable: true, onDelete: 'CASCADE' })
  deadline!: Deadline;

  // completed | issue | approved | rejected
  @Column()
  type!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}