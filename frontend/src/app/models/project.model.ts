export type ProjectStatus = 'active' | 'completed' | 'paused';

export interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  budget: number;
  createdAt?: string;
}

export type ProjectPayload = Omit<Project, 'id' | 'createdAt'>;