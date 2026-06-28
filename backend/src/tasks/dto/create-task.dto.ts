export class CreateTaskDto {
  title!: string;
  description!: string;
  status!: string;
  projectId?: number;
  assigneeId?: number;
  assignedById?: number;
}