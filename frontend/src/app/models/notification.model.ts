import { User } from './user.model';

export type NotificationType =
  | 'completed'
  | 'issue'
  | 'approved'
  | 'rejected'
  | 'deadline_soon'
  | 'deadline_overdue';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: User | null;
  task: { id: number; title: string; status: string } | null;
  deadline: {
    id: number;
    title: string;
    dueDate: string;
    project: { id: number; name: string } | null;
  } | null;
}