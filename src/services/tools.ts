import api from '@/lib/axios';
import { Tool, CreateToolDto, UpdateToolDto, PaginatedResponse } from '@/types';

export const toolService = {
  async getAll(search?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Tool>> {
    const { data } = await api.get<PaginatedResponse<Tool>>('/tools', {
      params: { search, page, limit },
    });
    return data;
  },

  async getById(id: string): Promise<Tool> {
    const { data } = await api.get<Tool>(`/tools/${id}`);
    return data;
  },

  async create(tool: CreateToolDto): Promise<Tool> {
    const { data } = await api.post<Tool>('/tools', tool);
    return data;
  },

  async update(id: string, tool: UpdateToolDto): Promise<Tool> {
    const { data } = await api.patch<Tool>(`/tools/${id}`, tool);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tools/${id}`);
  },
};

