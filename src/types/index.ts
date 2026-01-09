export enum ProcessType {
  MANUAL = 'MANUAL',
  SYSTEMIC = 'SYSTEMIC',
}

export enum ProcessStatus {
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  DEPRECATED = 'DEPRECATED',
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  processes?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ProcessTool {
  processId: string;
  toolId: string;
  tool: Tool;
}

export interface ProcessPerson {
  processId: string;
  personId: string;
  person: Person;
}

export interface ProcessDocument {
  processId: string;
  documentId: string;
  document: Document;
}

export interface Process {
  id: string;
  name: string;
  description?: string;
  type: ProcessType;
  status: ProcessStatus;
  departmentId: string;
  department?: Department;
  parentId?: string;
  parent?: Process;
  children?: Process[];
  childrenIds?: string[];
  tools?: ProcessTool[];
  people?: ProcessPerson[];
  documents?: ProcessDocument[];
  createdAt: string;
  updatedAt?: string;
}

export interface Person {
  id: string;
  name: string;
  role?: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Tool {
  id: string;
  name: string;
  normalizedName: string;
  description?: string;
  url?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  url?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateProcessDto {
  name: string;
  description?: string;
  type: ProcessType;
  status: ProcessStatus;
  departmentId: string;
  parentId?: string;
}

export interface UpdateProcessDto {
  name?: string;
  description?: string;
  type?: ProcessType;
  status?: ProcessStatus;
  departmentId?: string;
  parentId?: string;
}

export interface CreatePersonDto {
  name: string;
  role?: string;
  email: string;
}

export interface UpdatePersonDto {
  name?: string;
  role?: string;
  email?: string;
}

export interface CreateToolDto {
  name: string;
  description?: string;
  url?: string;
}

export interface UpdateToolDto {
  name?: string;
  description?: string;
  url?: string;
}

export interface CreateDocumentDto {
  title: string;
  description?: string;
  url?: string;
}

export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  color?: string;
  icon?: string;
}

export interface AuthResponse {
  token: string;
}

