//Propriedades Pagamento
export type FormaPagamento = "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO";
export type StatusPagamento = "PENDENTE" | "PAGO" | "ESTORNADO";

export interface Pagamento {
    id?: string;
    data: string;
    valor: number;
    forma: FormaPagamento;
    status: StatusPagamento;
    locacaoId: string;
}

export const pagamentoInicial: Pagamento = {
    data: "",
    valor: 0,
    forma: "PIX",
    status: "PAGO",
    locacaoId: "",
};

export const opcoesForma: { value: FormaPagamento; label: string }[] = [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "PIX", label: "Pix" },
    { value: "CARTAO_CREDITO", label: "Cartão de crédito" },
    { value: "CARTAO_DEBITO", label: "Cartão de débito" },
];

export const opcoesStatusPagamento: { value: StatusPagamento; label: string }[] = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "PAGO", label: "Pago" },
    { value: "ESTORNADO", label: "Estornado" },
];
