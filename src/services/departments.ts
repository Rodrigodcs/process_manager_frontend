import api from '@/lib/axios';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types';

export const departmentService = {
  async getAll(): Promise<Department[]> {
    const { data } = await api.get<Department[]>('/departments');
    return data;
  },

  async getById(id: string): Promise<Department> {
    const { data } = await api.get<Department>(`/departments/${id}`);
    return data;
  },

  async create(department: CreateDepartmentDto): Promise<Department> {
    const { data } = await api.post<Department>('/departments', department);
    return data;
  },

  async update(id: string, department: UpdateDepartmentDto): Promise<Department> {
    const { data } = await api.patch<Department>(`/departments/${id}`, department);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },
};

