import { api } from '@/lib/api/client';

export interface ListParams {
    [key: string]: string | number | boolean | undefined;
}

export interface Page<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/**
 * Base pra services de recurso REST padrão (list/getById/create/update/delete).
 * Um service específico instancia com o path do recurso: `new GenericService<Farm>('/api/orgs/acme/farms/')`.
 * Endpoints que não são CRUD-por-id (ex.: AuthService) não usam isso — a generalização
 * só vale a pena pro shape que se repete entre recursos.
 */
export class GenericService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    private readonly resourcePath: string;

    constructor(resourcePath: string) {
        this.resourcePath = resourcePath;
    }

    async list(params?: ListParams): Promise<Page<T>> {
        const response = await api.get<Page<T>>(this.resourcePath, { params });
        return response.data;
    }

    async getById(id: string | number): Promise<T> {
        const response = await api.get<T>(`${this.resourcePath}${id}/`);
        return response.data;
    }

    async create(data: TCreate): Promise<T> {
        const response = await api.post<T>(this.resourcePath, data);
        return response.data;
    }

    async update(id: string | number, data: TUpdate): Promise<T> {
        const response = await api.patch<T>(`${this.resourcePath}${id}/`, data);
        return response.data;
    }

    async delete(id: string | number): Promise<void> {
        await api.delete(`${this.resourcePath}${id}/`);
    }
}
