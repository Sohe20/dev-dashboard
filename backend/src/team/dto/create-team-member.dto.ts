export class CreateTeamMemberDto {
  name!: string;
  email!: string;
  role!: string;
  avatar?: string;
  userId?: number;
}