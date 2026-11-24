//Propriedades da vistoria
export type TipoVistoria = "RETIRADA" | "DEVOLUCAO";
export type NivelCombustivel = "VAZIO" | "1/4" | "1/2" | "3/4" | "CHEIO";

export interface Vistoria {
    id?: string;
    tipo: TipoVistoria;
    data: string;
    km: number;
    nivelCombustivel: NivelCombustivel;
    observacoes: string;
    locacaoId: string;
}

export const vistoriaInicial: Vistoria = {
    tipo: "RETIRADA",
    data: "",
    km: 0,
    nivelCombustivel: "CHEIO",
    observacoes: "",
    locacaoId: "",
};

export const opcoesCombustivel: { value: NivelCombustivel; label: string }[] = [
    { value: "VAZIO", label: "Vazio" },
    { value: "1/4", label: "1/4" },
    { value: "1/2", label: "1/2" },
    { value: "3/4", label: "3/4" },
    { value: "CHEIO", label: "Cheio" },
];
