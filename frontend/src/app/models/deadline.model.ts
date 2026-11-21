export const MAX_DEADLINES = 3;

export interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  isDone: boolean;
  createdAt: string;
}