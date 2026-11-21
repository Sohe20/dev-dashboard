import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class Deadline {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'timestamptz' })
  dueDate!: Date;

  @Column({ default: false })
  isDone!: boolean;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project!: Project;

  // برای مرحله یادآوری: هر یادآوری فقط یک بار فرستاده می‌شه
  @Column({ type: 'timestamptz', nullable: true })
  reminderSentAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  overdueSentAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}