//Propriedades do contrato
export interface Contrato {
    id?: string;
    numero: string;
    dataEmissao: string;
    termos: string;
    locacaoId: string;
}

export const contratoInicial: Contrato = {
    numero: "",
    dataEmissao: "",
    termos: "",
    locacaoId: "",
};

export function gerarTermos(
    cliente: string,
    placa: string,
    retirada: string,
    devolucaoPrevista: string,
    valorPrevisto: number
): string {
    return (
        `Contrato de locação de veículo firmado entre a locadora e o cliente ${cliente}. ` +
        `Veículo: ${placa}. Retirada: ${retirada}. Devolução prevista: ${devolucaoPrevista}. ` +
        `Valor previsto: R$ ${valorPrevisto.toFixed(2)}. ` +
        `O cliente se compromete a devolver o veículo nas mesmas condições da retirada, ` +
        `com o mesmo nível de combustível, e responde por multas e danos ocorridos durante o período.`
    );
}
