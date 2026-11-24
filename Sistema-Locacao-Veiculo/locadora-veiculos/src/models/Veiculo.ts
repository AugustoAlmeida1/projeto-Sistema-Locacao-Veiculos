//Propriedades de Veiculos
import type { Locacao } from "./Locacao";
import type { Manutencao } from "./Manutencao";

export type StatusVeiculo = "DISPONIVEL" | "LOCADO" | "EM_MANUTENCAO";

export interface Veiculo {
    id?: string;
    chassi: string;
    placa: string;
    anoFabricacao: number;
    cor: string;
    kmRodado: number;
    modeloId: string;
}

export const veiculoInicial: Veiculo = {
    chassi: "",
    placa: "",
    anoFabricacao: new Date().getFullYear(),
    cor: "",
    kmRodado: 0,
    modeloId: "",
};

export const rotuloStatusVeiculo: Record<StatusVeiculo, string> = {
    DISPONIVEL: "Disponível",
    LOCADO: "Locado",
    EM_MANUTENCAO: "Em manutenção",
};

/**
 * RF16: define se o veículo está disponível, locado ou em manutenção.
 * - Locado: possui locação com status ABERTA.
 * - Em manutenção: possui manutenção registrada com a data de hoje.
 */
export function calcularStatusVeiculo(
    veiculo: Veiculo,
    locacoes: Locacao[],
    manutencoes: Manutencao[],
    dataHoje: string
): StatusVeiculo {
    if (locacoes.some((l) => l.veiculoId === veiculo.id && l.status === "ABERTA")) return "LOCADO";
    if (manutencoes.some((m) => m.veiculoId === veiculo.id && m.data === dataHoje)) return "EM_MANUTENCAO";
    return "DISPONIVEL";
}
