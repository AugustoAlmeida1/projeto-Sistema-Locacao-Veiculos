import { api } from "./api";

export interface Entidade {
    id?: string;
}

/** Fábrica tipada com as 5 operações do CRUD. Cada serviço de entidade é criado a partir dela. */
export function criarCrud<T extends Entidade>(recurso: string) {
    return {
        listar: async (): Promise<T[]> => (await api.get<T[]>(recurso)).data,
        listarPor: async (filtros: Record<string, string>): Promise<T[]> =>
            (await api.get<T[]>(recurso, { params: filtros })).data,
        buscarPorId: async (id: string): Promise<T> => (await api.get<T>(`${recurso}/${id}`)).data,
        criar: async (obj: T): Promise<T> => (await api.post<T>(recurso, obj)).data,
        atualizar: async (id: string, obj: T): Promise<T> => (await api.put<T>(`${recurso}/${id}`, obj)).data,
        excluir: async (id: string): Promise<void> => {
            await api.delete(`${recurso}/${id}`);
        },
    };
}