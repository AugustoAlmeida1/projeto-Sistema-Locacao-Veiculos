import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { lerCampo } from "../../components/utils";
import type { CampoChange } from "../../components/utils";
import type { Categoria } from "../../models/Categoria";
import type { Marca } from "../../models/Marca";
import { modeloInicial } from "../../models/Modelo";
import type { Modelo } from "../../models/Modelo";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";

export function ModeloForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [modelo, setModelo] = useState<Modelo>(modeloInicial);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        Promise.all([marcaService.listar(), categoriaService.listar()])
            .then(([mar, cat]) => {
                setMarcas(mar);
                setCategorias(cat);
            })
            .catch(() => setErroApi(MSG_ERRO_API));
        if (id) modeloService.buscarPorId(id).then(setModelo).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setModelo((p) => ({ ...p, [name]: valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: Record<string, string> = {};
        if (!modelo.nome.trim()) novosErros.nome = "Informe o nome do modelo.";
        if (!modelo.ano || modelo.ano < 1990) novosErros.ano = "Informe um ano válido.";
        if (!modelo.marcaId) novosErros.marcaId = "Selecione a marca.";
        if (!modelo.categoriaId) novosErros.categoriaId = "Selecione a categoria.";
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) return;
        try {
            if (id) await modeloService.atualizar(id, modelo);
            else await modeloService.criar(modelo);
            navigate("/modelos", { state: { msg: id ? "Modelo atualizado com sucesso." : "Modelo cadastrado com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar modelo" : "Novo modelo"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <Input label="Nome" name="nome" value={modelo.nome} onChange={handleChange} error={erros.nome} />
                <Input label="Ano" name="ano" type="number" value={modelo.ano} onChange={handleChange} error={erros.ano} />
                <Select label="Marca" name="marcaId" value={modelo.marcaId} onChange={handleChange} error={erros.marcaId}
                    options={marcas.map((m) => ({ value: m.id ?? "", label: m.nome }))} />
                <Select label="Categoria" name="categoriaId" value={modelo.categoriaId} onChange={handleChange} error={erros.categoriaId}
                    options={categorias.map((c) => ({ value: c.id ?? "", label: c.nome }))} />
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/modelos")} />
                </div>
            </form>
        </Card>
    );
}
