import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Cliente } from "../../models/Cliente";
import { opcoesStatusLocacao } from "../../models/Locacao";
import type { Locacao, StatusLocacao } from "../../models/Locacao";
import type { Veiculo } from "../../models/Veiculo";
import { MSG_ERRO_API } from "../../service/api";
import { clienteService } from "../../service/clienteService";
import { locacaoService } from "../../service/locacaoService";
import { veiculoService } from "../../service/veiculoService";

const corStatus: Record<StatusLocacao, "primary" | "success" | "secondary"> = {
    ABERTA: "primary",
    FINALIZADA: "success",
    CANCELADA: "secondary",
};

export function LocacaoList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [locacoes, setLocacoes] = useState<Locacao[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroCliente, setFiltroCliente] = useState("");
    const [alvo, setAlvo] = useState<Locacao | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            const [loc, cli, vei] = await Promise.all([locacaoService.listar(), clienteService.listar(), veiculoService.listar()]);
            setLocacoes(loc);
            setClientes(cli);
            setVeiculos(vei);
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    async function confirmarCancelamento() {
        if (!alvo?.id) return;
        try {
            await locacaoService.atualizar(alvo.id, { ...alvo, status: "CANCELADA" });
            setMensagem({ tipo: "success", texto: "Locação cancelada. O veículo voltou a ficar disponível." });
            await carregar();
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    const lista = locacoes.filter(
        (l) => (!filtroStatus || l.status === filtroStatus) && (!filtroCliente || l.clienteId === filtroCliente)
    );

    const colunas: Column<Locacao>[] = [
        { header: "Nº", render: (l) => l.id },
        { header: "Cliente", render: (l) => clientes.find((c) => c.id === l.clienteId)?.nome ?? "-" },
        { header: "Veículo", render: (l) => veiculos.find((v) => v.id === l.veiculoId)?.placa ?? "-" },
        { header: "Retirada", render: (l) => formatarData(l.dataRetirada) },
        { header: "Devolução prevista", render: (l) => formatarData(l.dataDevolucaoPrevista) },
        { header: "Valor", render: (l) => formatarMoeda(l.valorTotal) },
        { header: "Status", render: (l) => <Badge text={l.status} color={corStatus[l.status]} /> },
    ];

    return (
        <Card title="Locações">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="row align-items-end">
                <div className="col-12 col-md-4">
                    <Select label="Status" name="filtroStatus" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
                        placeholder="Todos" options={opcoesStatusLocacao} />
                </div>
                <div className="col-12 col-md-4">
                    <Select label="Cliente" name="filtroCliente" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}
                        placeholder="Todos" options={clientes.map((c) => ({ value: c.id ?? "", label: c.nome }))} />
                </div>
                <div className="col-12 col-md-4 mb-3">
                    <Button label="Nova locação" variant="success" onClick={() => navigate("/locacoes/nova")} />
                </div>
            </div>
            <Table
                columns={colunas}
                data={lista}
                acoes={(l) => (
                    <>
                        <Button label="Detalhes" variant="primary" size="sm" onClick={() => navigate(`/locacoes/${l.id}`)} />
                        {l.status === "ABERTA" && <Button label="Devolução" variant="success" size="sm" onClick={() => navigate(`/locacoes/${l.id}/devolucao`)} />}
                        {l.status === "ABERTA" && <Button label="Cancelar" variant="danger" size="sm" onClick={() => setAlvo(l)} />}
                    </>
                )}
            />
            <Modal show={alvo !== null} title="Cancelar locação" onClose={() => setAlvo(null)} onConfirm={confirmarCancelamento} confirmLabel="Cancelar locação">
                Deseja cancelar a locação nº <strong>{alvo?.id}</strong>?
            </Modal>
        </Card>
    );
}
