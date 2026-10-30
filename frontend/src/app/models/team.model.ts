export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  userId: number | null;
  createdAt: string;
}

export interface TeamMemberPayload {
  name: string;
  email: string;
  role: string;
  userId: number;
}