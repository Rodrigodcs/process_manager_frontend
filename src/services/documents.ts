import api from '@/lib/axios';
import { Document, CreateDocumentDto, UpdateDocumentDto, PaginatedResponse } from '@/types';

export const documentService = {
  async getAll(search?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Document>> {
    const { data } = await api.get<PaginatedResponse<Document>>('/documents', {
      params: { search, page, limit },
    });
    return data;
  },

  async getById(id: string): Promise<Document> {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },

  async create(document: CreateDocumentDto): Promise<Document> {
    const { data } = await api.post<Document>('/documents', document);
    return data;
  },

  async update(id: string, document: UpdateDocumentDto): Promise<Document> {
    const { data } = await api.patch<Document>(`/documents/${id}`, document);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};

