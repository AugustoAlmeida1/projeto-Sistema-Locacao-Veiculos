import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Cliente } from "../../models/Cliente";
import { MSG_ERRO_API } from "../../service/api";
import { clienteService } from "../../service/clienteService";
import { locacaoService } from "../../service/locacaoService";

export function ClienteList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [alvo, setAlvo] = useState<Cliente | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            setClientes(await clienteService.listar());
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
            const dependentes = await locacaoService.listarPor({ clienteId: alvo.id });
            if (dependentes.length > 0) {
                setMensagem({ tipo: "warning", texto: `Não é possível excluir o cliente "${alvo.nome}": existem ${dependentes.length} locação(ões) vinculada(s).` });
            } else {
                await clienteService.excluir(alvo.id);
                setMensagem({ tipo: "success", texto: "Cliente excluído com sucesso." });
                await carregar();
            }
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    const colunas: Column<Cliente>[] = [
        { header: "Nome", render: (c) => c.nome },
        { header: "CPF", render: (c) => c.cpf },
        { header: "CNH", render: (c) => c.cnh },
        {
            header: "Validade CNH",
            render: (c) => (
                <>
                    {formatarData(c.validadeCnh)}{" "}
                    {c.validadeCnh < hoje() && <Badge text="Vencida" color="danger" />}
                </>
            ),
        },
        { header: "Telefone", render: (c) => c.telefone },
    ];

    return (
        <Card title="Clientes">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="mb-3">
                <Button label="Novo cliente" variant="success" onClick={() => navigate("/clientes/novo")} />
            </div>
            <Table columns={colunas} data={clientes} onEdit={(c) => navigate(`/clientes/${c.id}/editar`)} onDelete={setAlvo} />
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir o cliente <strong>{alvo?.nome}</strong>?
            </Modal>
        </Card>
    );
}
