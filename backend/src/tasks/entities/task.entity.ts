import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

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

  @CreateDateColumn()
  createdAt!: Date;
}