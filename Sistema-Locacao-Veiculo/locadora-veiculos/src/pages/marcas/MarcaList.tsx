import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Marca } from "../../models/Marca";
import { MSG_ERRO_API } from "../../service/api";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";

export function MarcaList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [alvo, setAlvo] = useState<Marca | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            setMarcas(await marcaService.listar());
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
            const dependentes = await modeloService.listarPor({ marcaId: alvo.id });
            if (dependentes.length > 0) {
                setMensagem({ tipo: "warning", texto: `Não é possível excluir a marca "${alvo.nome}": existem ${dependentes.length} modelo(s) vinculado(s).` });
            } else {
                await marcaService.excluir(alvo.id);
                setMensagem({ tipo: "success", texto: "Marca excluída com sucesso." });
                await carregar();
            }
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    const colunas: Column<Marca>[] = [
        { header: "ID", render: (m) => m.id },
        { header: "Nome", render: (m) => m.nome },
    ];

    return (
        <Card title="Marcas">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="mb-3">
                <Button label="Nova marca" variant="success" onClick={() => navigate("/marcas/novo")} />
            </div>
            <Table columns={colunas} data={marcas} onEdit={(m) => navigate(`/marcas/${m.id}/editar`)} onDelete={setAlvo} />
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir a marca <strong>{alvo?.nome}</strong>?
            </Modal>
        </Card>
    );
}
