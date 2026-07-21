export interface Branch {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
}

// Supervisors log in with username + branch code (same pattern as barbers /
// sellers), not with an email.
export interface CreateBranchSupervisorInput {
  name: string;
  username: string;
  password: string;
}
