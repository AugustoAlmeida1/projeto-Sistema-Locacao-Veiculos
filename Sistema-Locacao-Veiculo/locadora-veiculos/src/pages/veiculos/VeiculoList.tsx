import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import { hoje } from "../../components/utils";
import type { Locacao } from "../../models/Locacao";
import type { Manutencao } from "../../models/Manutencao";
import type { Modelo } from "../../models/Modelo";
import { calcularStatusVeiculo, rotuloStatusVeiculo } from "../../models/Veiculo";
import type { StatusVeiculo, Veiculo } from "../../models/Veiculo";
import { MSG_ERRO_API } from "../../service/api";
import { locacaoService } from "../../service/locacaoService";
import { manutencaoService } from "../../service/manutencaoService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

const corStatus: Record<StatusVeiculo, "success" | "danger" | "warning"> = {
    DISPONIVEL: "success",
    LOCADO: "danger",
    EM_MANUTENCAO: "warning",
};

export function VeiculoList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [locacoes, setLocacoes] = useState<Locacao[]>([]);
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [alvo, setAlvo] = useState<Veiculo | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            const [vei, mod, loc, man] = await Promise.all([
                veiculoService.listar(),
                modeloService.listar(),
                locacaoService.listar(),
                manutencaoService.listar(),
            ]);
            setVeiculos(vei);
            setModelos(mod);
            setLocacoes(loc);
            setManutencoes(man);
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    async function confirmarExclusao() {
        if (!alvo?.id) return;
        const qtdLocacoes = locacoes.filter((l) => l.veiculoId === alvo.id).length;
        const qtdManutencoes = manutencoes.filter((m) => m.veiculoId === alvo.id).length;
        if (qtdLocacoes + qtdManutencoes > 0) {
            setMensagem({
                tipo: "warning",
                texto: `Não é possível excluir o veículo ${alvo.placa}: existem ${qtdLocacoes} locação(ões) e ${qtdManutencoes} manutenção(ões) vinculada(s).`,
            });
        } else {
            try {
                await veiculoService.excluir(alvo.id);
                setMensagem({ tipo: "success", texto: "Veículo excluído com sucesso." });
                await carregar();
            } catch {
                setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
            }
        }
        setAlvo(null);
    }

    const colunas: Column<Veiculo>[] = [
        { header: "Placa", render: (v) => v.placa },
        { header: "Modelo", render: (v) => modelos.find((m) => m.id === v.modeloId)?.nome ?? "-" },
        { header: "Cor", render: (v) => v.cor },
        { header: "Ano", render: (v) => v.anoFabricacao },
        { header: "Km", render: (v) => v.kmRodado.toLocaleString("pt-BR") },
        {
            header: "Situação",
            render: (v) => {
                const status = calcularStatusVeiculo(v, locacoes, manutencoes, hoje());
                return <Badge text={rotuloStatusVeiculo[status]} color={corStatus[status]} />;
            },
        },
    ];

    return (
        <Card title="Veículos">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="mb-3">
                <Button label="Novo veículo" variant="success" onClick={() => navigate("/veiculos/novo")} />
            </div>
            <Table
                columns={colunas}
                data={veiculos}
                onEdit={(v) => navigate(`/veiculos/${v.id}/editar`)}
                onDelete={setAlvo}
                acoes={(v) => <Button label="Manutenções" variant="info" size="sm" onClick={() => navigate(`/manutencoes?veiculoId=${v.id}`)} />}
            />
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir o veículo <strong>{alvo?.placa}</strong>?
            </Modal>
        </Card>
    );
}
