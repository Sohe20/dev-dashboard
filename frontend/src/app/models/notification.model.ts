import { User } from './user.model';

export type NotificationType = 'completed' | 'issue' | 'approved' | 'rejected';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: User | null;
  task: { id: number; title: string; status: string } | null;
}