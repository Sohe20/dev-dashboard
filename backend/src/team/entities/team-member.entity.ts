import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  role!: string;

  @Column({ nullable: true })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}