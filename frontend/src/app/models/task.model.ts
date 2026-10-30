import { Project } from './project.model';
import { User } from './user.model';

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  project: Pick<Project, 'id' | 'name'> | null;
  assignee: User | null;
  assignedBy: User | null;
  createdAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  projectId: number | null;
  assigneeId: number | null;
}