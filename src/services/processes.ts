import api from '@/lib/axios';
import { CreateProcessDto, Document, PaginatedResponse, Person, Process, Tool, UpdateProcessDto } from '@/types';

export const processService = {
  async getAll(): Promise<Process[]> {
    const { data } = await api.get<Process[]>('/processes');
    return data;
  },

  async getById(id: string): Promise<Process> {
    const { data } = await api.get<Process>(`/processes/${id}`);
    return data;
  },

  async getByDepartment(
    departmentId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Process>> {
    const { page = 1, limit = 10 } = options;
    const { data } = await api.get<PaginatedResponse<Process>>(
      `/processes/department/${departmentId}`,
      { params: { page, limit } }
    );
    return data;
  },

  async getChildren(processId: string): Promise<Process[]> {
    const { data } = await api.get<Process[]>(`/processes/${processId}/children`);
    return data;
  },

  async create(process: CreateProcessDto): Promise<Process> {
    const { data } = await api.post<Process>('/processes', process);
    return data;
  },

  async update(id: string, process: UpdateProcessDto): Promise<Process> {
    const { data } = await api.patch<Process>(`/processes/${id}`, process);
    return data;
  },

  async reorderChildren(parentId: string, processIds: string[]): Promise<Process[]> {
    const { data } = await api.patch<Process[]>(
      `/processes/${parentId}/children/reorder`,
      { processIds }
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/processes/${id}`);
  },

  async getPeople(processId: string): Promise<Person[]> {
    const { data } = await api.get<Person[]>(`/processes/${processId}/people`);
    return data;
  },

  async addPeople(processId: string, personIds: string[]): Promise<{ linked: number; skipped: number }> {
    const { data } = await api.post(`/processes/${processId}/people/bulk`, { personIds });
    return data;
  },

  async removePerson(processId: string, personId: string): Promise<void> {
    await api.delete(`/processes/${processId}/people/${personId}`);
  },

  async getTools(processId: string): Promise<Tool[]> {
    const { data } = await api.get<Tool[]>(`/processes/${processId}/tools`);
    return data;
  },

  async addTools(processId: string, toolIds: string[]): Promise<{ linked: number; skipped: number }> {
    const { data } = await api.post(`/processes/${processId}/tools/bulk`, { toolIds });
    return data;
  },

  async removeTool(processId: string, toolId: string): Promise<void> {
    await api.delete(`/processes/${processId}/tools/${toolId}`);
  },

  async getDocuments(processId: string): Promise<Document[]> {
    const { data } = await api.get<Document[]>(`/processes/${processId}/documents`);
    return data;
  },

  async addDocuments(processId: string, documentIds: string[]): Promise<{ linked: number; skipped: number }> {
    const { data } = await api.post(`/processes/${processId}/documents/bulk`, { documentIds });
    return data;
  },

  async removeDocument(processId: string, documentId: string): Promise<void> {
    await api.delete(`/processes/${processId}/documents/${documentId}`);
  },
};

