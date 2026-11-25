import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { lerCampo } from "../../components/utils";
import type { CampoChange } from "../../components/utils";
import { marcaInicial } from "../../models/Marca";
import type { Marca } from "../../models/Marca";
import { MSG_ERRO_API } from "../../service/api";
import { marcaService } from "../../service/marcaService";

export function MarcaForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [marca, setMarca] = useState<Marca>(marcaInicial);
    const [erros, setErros] = useState<{ nome?: string }>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        if (id) marcaService.buscarPorId(id).then(setMarca).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setMarca((p) => ({ ...p, [name]: valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!marca.nome.trim()) {
            setErros({ nome: "Informe o nome da marca." });
            return;
        }
        try {
            if (id) await marcaService.atualizar(id, marca);
            else await marcaService.criar(marca);
            navigate("/marcas", { state: { msg: id ? "Marca atualizada com sucesso." : "Marca cadastrada com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar marca" : "Nova marca"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <Input label="Nome" name="nome" value={marca.nome} onChange={handleChange} error={erros.nome} />
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/marcas")} />
                </div>
            </form>
        </Card>
    );
}
