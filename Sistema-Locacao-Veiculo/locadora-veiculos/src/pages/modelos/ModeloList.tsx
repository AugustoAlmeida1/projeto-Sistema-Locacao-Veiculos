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
import type { Marca } from "../../models/Marca";
import type { Modelo } from "../../models/Modelo";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

export function ModeloList() {
    const navigate = useNavigate();
    const estado = useLocation().state as { msg?: string } | null;
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [alvo, setAlvo] = useState<Modelo | null>(null);
    const [mensagem, setMensagem] = useState<Mensagem | null>(estado?.msg ? { tipo: "success", texto: estado.msg } : null);

    const carregar = useCallback(async () => {
        try {
            const [mod, mar, cat] = await Promise.all([modeloService.listar(), marcaService.listar(), categoriaService.listar()]);
            setModelos(mod);
            setMarcas(mar);
            setCategorias(cat);
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
            const dependentes = await veiculoService.listarPor({ modeloId: alvo.id });
            if (dependentes.length > 0) {
                setMensagem({ tipo: "warning", texto: `Não é possível excluir o modelo "${alvo.nome}": existem ${dependentes.length} veículo(s) vinculado(s).` });
            } else {
                await modeloService.excluir(alvo.id);
                setMensagem({ tipo: "success", texto: "Modelo excluído com sucesso." });
                await carregar();
            }
        } catch {
            setMensagem({ tipo: "danger", texto: MSG_ERRO_API });
        }
        setAlvo(null);
    }

    const colunas: Column<Modelo>[] = [
        { header: "Nome", render: (m) => m.nome },
        { header: "Ano", render: (m) => m.ano },
        { header: "Marca", render: (m) => marcas.find((x) => x.id === m.marcaId)?.nome ?? "-" },
        { header: "Categoria", render: (m) => categorias.find((x) => x.id === m.categoriaId)?.nome ?? "-" },
    ];

    return (
        <Card title="Modelos">
            {mensagem && <Alert type={mensagem.tipo} message={mensagem.texto} onClose={() => setMensagem(null)} />}
            <div className="mb-3">
                <Button label="Novo modelo" variant="success" onClick={() => navigate("/modelos/novo")} />
            </div>
            <Table columns={colunas} data={modelos} onEdit={(m) => navigate(`/modelos/${m.id}/editar`)} onDelete={setAlvo} />
            <Modal show={alvo !== null} title="Confirmar exclusão" onClose={() => setAlvo(null)} onConfirm={confirmarExclusao} confirmLabel="Excluir">
                Deseja excluir o modelo <strong>{alvo?.nome}</strong>?
            </Modal>
        </Card>
    );
}
