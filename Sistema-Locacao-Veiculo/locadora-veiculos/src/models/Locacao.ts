//Propriedades da locacao
export type StatusLocacao = "ABERTA" | "FINALIZADA" | "CANCELADA";

export interface Locacao {
    id?: string;
    dataRetirada: string;
    dataDevolucaoPrevista: string;
    dataDevolucaoReal?: string;
    kmRetirada: number;
    kmDevolucao?: number;
    valorTotal: number;
    status: StatusLocacao;
    clienteId: string;
    veiculoId: string;
}

export const locacaoInicial: Locacao = {
    dataRetirada: "",
    dataDevolucaoPrevista: "",
    kmRetirada: 0,
    valorTotal: 0,
    status: "ABERTA",
    clienteId: "",
    veiculoId: "",
};

export const opcoesStatusLocacao: { value: StatusLocacao; label: string }[] = [
    { value: "ABERTA", label: "Aberta" },
    { value: "FINALIZADA", label: "Finalizada" },
    { value: "CANCELADA", label: "Cancelada" },
];

/** Número de diárias entre duas datas (qualquer fração de dia conta como uma diária). */
export function calcularDiarias(inicio: string, fim: string): number {
    const ms = new Date(fim).getTime() - new Date(inicio).getTime();
    if (Number.isNaN(ms) || ms <= 0) return 0;
    return Math.ceil(ms / 86400000);
}

/** RF08: nº de diárias × valor da diária da categoria. */
export function calcularValorLocacao(diarias: number, valorDiaria: number): number {
    return diarias * valorDiaria;
}
