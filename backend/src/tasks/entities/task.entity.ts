import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 'todo' })
  status!: string;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  project!: Project;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignee!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}