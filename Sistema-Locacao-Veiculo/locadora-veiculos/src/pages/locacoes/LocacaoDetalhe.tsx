import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Cliente } from "../../models/Cliente";
import type { Contrato } from "../../models/Contrato";
import type { Locacao } from "../../models/Locacao";
import type { Modelo } from "../../models/Modelo";
import type { NotaFiscal } from "../../models/NotaFiscal";
import { opcoesForma, opcoesStatusPagamento, pagamentoInicial } from "../../models/Pagamento";
import type { Pagamento } from "../../models/Pagamento";
import type { Veiculo } from "../../models/Veiculo";
import type { Vistoria } from "../../models/Vistoria";
import { MSG_ERRO_API } from "../../service/api";
import { clienteService } from "../../service/clienteService";
import { contratoService } from "../../service/contratoService";
import { locacaoService } from "../../service/locacaoService";
import { modeloService } from "../../service/modeloService";
import { notaFiscalService } from "../../service/notaFiscalService";
import { pagamentoService } from "../../service/pagamentoService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

export function LocacaoDetalhe() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [locacao, setLocacao] = useState<Locacao | null>(null);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [modelo, setModelo] = useState<Modelo | null>(null);
    const [contrato, setContrato] = useState<Contrato | null>(null);
    const [vistorias, setVistorias] = useState<Vistoria[]>([]);
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [nota, setNota] = useState<NotaFiscal | null>(null);
    const [pag, setPag] = useState<Pagamento>({ ...pagamentoInicial, data: hoje() });
    const [errosPag, setErrosPag] = useState<Record<string, string>>({});
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        if (!id) return;
        try {
            const loc = await locacaoService.buscarPorId(id);
            const [cli, vei, cts, vis, pags, nfs] = await Promise.all([
                clienteService.buscarPorId(loc.clienteId),
                veiculoService.buscarPorId(loc.veiculoId),
                contratoService.listarPor({ locacaoId: id }),
                vistoriaService.listarPor({ locacaoId: id }),
                pagamentoService.listarPor({ locacaoId: id }),
                notaFiscalService.listarPor({ locacaoId: id }),
            ]);
            const mod = await modeloService.buscarPorId(vei.modeloId);
            setLocacao(loc);
            setCliente(cli);
            setVeiculo(vei);
            setModelo(mod);
            setContrato(cts[0] ?? null);
            setVistorias(vis);
            setPagamentos(pags);
            setNota(nfs[0] ?? null);
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }, [id]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setPag((p) => ({ ...p, [name]: valor }));
    }

    // RF12: vários pagamentos por locação
    async function registrarPagamento(e: FormEvent) {
        e.preventDefault();
        if (!id) return;
        const novosErros: Record<string, string> = {};
        if (!pag.data) novosErros.data = "Informe a data.";
        if (pag.valor <= 0) novosErros.valor = "O valor deve ser maior que zero.";
        if (!pag.forma) novosErros.forma = "Selecione a forma de pagamento.";
        if (!pag.status) novosErros.status = "Selecione o status.";
        setErrosPag(novosErros);
        if (Object.keys(novosErros).length > 0) return;
        try {
            await pagamentoService.criar({ ...pag, locacaoId: id });
            setPag({ ...pagamentoInicial, data: hoje() });
            setMensagem({ tipo: "success", texto: "Pagamento registrado." });
            await carregar();
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }

    // RF13 + RN05: nota fiscal somente para locação finalizada, no máximo uma
    async function emitirNota() {
        if (!id || !locacao) return;
        if (locacao.status !== "FINALIZADA") {
            setMensagem({ tipo: "warning", texto: "A nota fiscal só pode ser emitida para locações finalizadas." });
            return;
        }
        if (nota) {
            setMensagem({ tipo: "warning", texto: "Esta locação já possui nota fiscal." });
            return;
        }
        try {
            const todas = await notaFiscalService.listar();
            await notaFiscalService.criar({
                numero: String(todas.length + 1).padStart(6, "0"),
                serie: "1",
                dataEmissao: hoje(),
                valor: locacao.valorTotal,
                locacaoId: id,
            });
            setMensagem({ tipo: "success", texto: "Nota fiscal emitida." });
            await carregar();
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }

    const colunasVistoria: Column<Vistoria>[] = [
        { header: "Tipo", render: (v) => v.tipo },
        { header: "Data", render: (v) => formatarData(v.data) },
        { header: "Km", render: (v) => v.km.toLocaleString("pt-BR") },
        { header: "Combustível", render: (v) => v.nivelCombustivel },
        { header: "Observações", render: (v) => v.observacoes || "-" },
    ];
    const colunasPagamento: Column<Pagamento>[] = [
        { header: "Data", render: (p) => formatarData(p.data) },
        { header: "Valor", render: (p) => formatarMoeda(p.valor) },
        { header: "Forma", render: (p) => opcoesForma.find((o) => o.value === p.forma)?.label ?? p.forma },
        { header: "Status", render: (p) => p.status },
    ];

    if (!locacao) {
        return mensagem ? <Alert type={mensagem.tipo} message={mensagem.texto} /> : <p>Carregando...</p>;
    }

    const totalPago = pagamentos.filter((p) => p.status === "PAGO").reduce((soma, p) => soma + p.valor, 0);

    return (
        <>
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}

            <Card title={`Locação nº ${locacao.id}`}>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <p><strong>Cliente:</strong> {cliente?.nome} ({cliente?.cpf})</p>
                        <p><strong>CNH:</strong> {cliente?.cnh} - validade {formatarData(cliente?.validadeCnh)}</p>
                        <p><strong>Veículo:</strong> {veiculo?.placa} - {modelo?.nome} {veiculo?.cor}</p>
                    </div>
                    <div className="col-12 col-md-6">
                        <p><strong>Retirada:</strong> {formatarData(locacao.dataRetirada)} ({locacao.kmRetirada} km)</p>
                        <p><strong>Devolução prevista:</strong> {formatarData(locacao.dataDevolucaoPrevista)}</p>
                        <p><strong>Devolução real:</strong> {formatarData(locacao.dataDevolucaoReal)} {locacao.kmDevolucao !== undefined && `(${locacao.kmDevolucao} km)`}</p>
                        <p><strong>Valor total:</strong> {formatarMoeda(locacao.valorTotal)} <Badge text={locacao.status} color={locacao.status === "FINALIZADA" ? "success" : locacao.status === "ABERTA" ? "primary" : "secondary"} /></p>
                    </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {locacao.status === "ABERTA" && <Button label="Registrar devolução" variant="success" onClick={() => navigate(`/locacoes/${id}/devolucao`)} />}
                    <Button label="Voltar" variant="secondary" onClick={() => navigate("/locacoes")} />
                </div>
            </Card>

            <Card title="Contrato">
                {contrato ? (
                    <>
                        <p><strong>Nº:</strong> {contrato.numero} - emitido em {formatarData(contrato.dataEmissao)}</p>
                        <p className="mb-0">{contrato.termos}</p>
                    </>
                ) : (
                    <p className="mb-0 text-muted">Contrato não encontrado.</p>
                )}
            </Card>

            <Card title="Vistorias">
                <Table columns={colunasVistoria} data={vistorias} />
            </Card>

            <Card title="Pagamentos">
                <Table columns={colunasPagamento} data={pagamentos} emptyMessage="Nenhum pagamento registrado." />
                <p className="fw-semibold">Total pago: {formatarMoeda(totalPago)} de {formatarMoeda(locacao.valorTotal)}</p>
                <form onSubmit={registrarPagamento} noValidate>
                    <div className="row">
                        <div className="col-12 col-md-3"><Input label="Data" name="data" type="date" value={pag.data} onChange={handleChange} error={errosPag.data} /></div>
                        <div className="col-12 col-md-3"><Input label="Valor (R$)" name="valor" type="number" value={pag.valor} onChange={handleChange} error={errosPag.valor} min={0} /></div>
                        <div className="col-12 col-md-3"><Select label="Forma" name="forma" value={pag.forma} onChange={handleChange} options={opcoesForma} error={errosPag.forma} /></div>
                        <div className="col-12 col-md-3"><Select label="Status" name="status" value={pag.status} onChange={handleChange} options={opcoesStatusPagamento} error={errosPag.status} /></div>
                    </div>
                    <Button label="Registrar pagamento" type="submit" variant="success" />
                </form>
            </Card>

            <Card title="Nota fiscal">
                {nota ? (
                    <p className="mb-0">
                        <strong>Nº {nota.numero}</strong> (série {nota.serie}) - emitida em {formatarData(nota.dataEmissao)} - {formatarMoeda(nota.valor)}
                    </p>
                ) : (
                    <>
                        <p className="text-muted">Nenhuma nota fiscal emitida.</p>
                        <Button label="Emitir nota fiscal" variant="primary" onClick={emitirNota} />
                    </>
                )}
            </Card>
        </>
    );
}
