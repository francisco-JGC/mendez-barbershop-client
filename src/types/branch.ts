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

export interface CreateBranchAdminInput {
  name: string;
  email: string;
  password: string;
}
