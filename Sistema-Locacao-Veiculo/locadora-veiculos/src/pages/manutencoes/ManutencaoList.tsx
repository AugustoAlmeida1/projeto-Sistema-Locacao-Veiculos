import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { MSG_ERRO_API } from "../../service/api";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";

export function ManutencaoList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [params, setParams] = useSearchParams();
    const veiculoFiltro = params.get("veiculoId") ?? "";
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [alvo, setAlvo] = useState<Manutencao | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            const [man, vei] = await Promise.all([manutencaoService.listar(), veiculoService.listar()]);
            setManutencoes(man);
            setVeiculos(vei);
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    async function confirmarExclusao() {
        if (!alvo?.id) return;
        try {
            await manutencaoService.excluir(alvo.id);
            setMensagem({ tipo: "success", texto: "Manutenção excluída com sucesso." });
            await carregar();
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    function filtrar(e: ChangeEvent<HTMLSelectElement>) {
        setParams(e.target.value ? { veiculoId: e.target.value } : {});
    }

    const lista = manutencoes
        .filter((m) => !veiculoFiltro || m.veiculoId === veiculoFiltro)
        .sort((a, b) => b.data.localeCompare(a.data));
    const total = lista.reduce((soma, m) => soma + m.valor, 0);

    const colunas: Column<Manutencao>[] = [
        { header: "Data", render: (m) => formatarData(m.data) },
        { header: "Veículo", render: (m) => veiculos.find((v) => v.id === m.veiculoId)?.placa ?? "-" },
        { header: "Descrição", render: (m) => m.descricao },
        { header: "Valor", render: (m) => formatarMoeda(m.valor) },
    ];

    return (
        <Card title="Manutenções (histórico por veículo)">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="row align-items-end">
                <div className="col-12 col-md-6">
                    <Select label="Filtrar por veículo" name="veiculoId" value={veiculoFiltro} onChange={filtrar} placeholder="Todos os veículos"
                        options={veiculos.map((v) => ({ value: v.id ?? "", label: v.placa }))} />
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <Button label="Nova manutenção" variant="success" onClick={() => navigate("/manutencoes/novo")} />
                </div>
            </div>
            <Table columns={colunas} data={lista} onEdit={(m) => navigate(`/manutencoes/${m.id}/editar`)} onDelete={setAlvo} />
            <p className="fw-semibold">Total em manutenções: {formatarMoeda(total)}</p>
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir esta manutenção?
            </Modal>
        </Card>
    );
}
