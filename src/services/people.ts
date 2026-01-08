import api from '@/lib/axios';
import { Person, CreatePersonDto, UpdatePersonDto, PaginatedResponse } from '@/types';

export const personService = {
  async getAll(search?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Person>> {
    const { data } = await api.get<PaginatedResponse<Person>>('/people', {
      params: { search, page, limit },
    });
    return data;
  },

  async getById(id: string): Promise<Person> {
    const { data } = await api.get<Person>(`/people/${id}`);
    return data;
  },

  async create(person: CreatePersonDto): Promise<Person> {
    const { data } = await api.post<Person>('/people', person);
    return data;
  },

  async update(id: string, person: UpdatePersonDto): Promise<Person> {
    const { data } = await api.patch<Person>(`/people/${id}`, person);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/people/${id}`);
  },
};

