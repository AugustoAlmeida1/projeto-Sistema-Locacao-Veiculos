import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import type { Mensagem } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table } from "../../components/Table";
import type { Column } from "../../components/Table";
import type { Categoria } from "../../models/Categoria";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";
import { modeloService } from "../../service/modeloService";

export function CategoriaList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [alvo, setAlvo] = useState<Categoria | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            setCategorias(await categoriaService.listar());
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
            const dependentes = await modeloService.listarPor({ categoriaId: alvo.id });
            if (dependentes.length > 0) {
                setMensagem({ tipo: "warning", texto: `Não é possível excluir a categoria "${alvo.nome}": existem ${dependentes.length} modelo(s) vinculado(s).` });
            } else {
                await categoriaService.excluir(alvo.id);
                setMensagem({ tipo: "success", texto: "Categoria excluída com sucesso." });
                await carregar();
            }
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    const colunas: Column<Categoria>[] = [
        { header: "ID", render: (m) => m.id },
        { header: "Nome", render: (m) => m.nome },
        { header: "Valor da diária", render: (m) => formatarMoeda(m.valorLocacao) },
    ];

    return (
        <Card title="Categorias">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="mb-3">
                <Button label="Nova categoria" variant="success" onClick={() => navigate("/categorias/novo")} />
            </div>
            <Table columns={colunas} data={categorias} onEdit={(m) => navigate(`/categorias/${m.id}/editar`)} onDelete={setAlvo} />
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir a categoria <strong>{alvo?.nome}</strong>?
            </Modal>
        </Card>
    );
}
