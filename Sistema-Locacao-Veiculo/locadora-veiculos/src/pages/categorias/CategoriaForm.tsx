import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { lerCampo } from "../../components/utils";
import type { CampoChange } from "../../components/utils";
import { categoriaInicial } from "../../models/Categoria";
import type { Categoria } from "../../models/Categoria";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";

export function CategoriaForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categoria, setCategoria] = useState<Categoria>(categoriaInicial);
    const [erros, setErros] = useState<{ nome?: string; valorLocacao?: string }>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        if (id) categoriaService.buscarPorId(id).then(setCategoria).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setCategoria((p) => ({ ...p, [name]: valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: { nome?: string; valorLocacao?: string } = {};
        if (!categoria.nome.trim()) novosErros.nome = "Informe o nome da categoria.";
        if (categoria.valorLocacao <= 0) novosErros.valorLocacao = "O valor da diária deve ser maior que zero.";
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) return;
        try {
            if (id) await categoriaService.atualizar(id, categoria);
            else await categoriaService.criar(categoria);
            navigate("/categorias", { state: { msg: id ? "Categoria atualizada com sucesso." : "Categoria cadastrada com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar categoria" : "Nova categoria"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <Input label="Nome" name="nome" value={categoria.nome} onChange={handleChange} error={erros.nome} />
                <Input label="Valor da diária (R$)" name="valorLocacao" type="number" value={categoria.valorLocacao} onChange={handleChange} error={erros.valorLocacao}/>
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/categorias")} />
                </div>
            </form>
        </Card>
    );
}
