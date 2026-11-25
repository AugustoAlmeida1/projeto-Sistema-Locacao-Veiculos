import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { manutencaoInicial } from "../../models/Manutencao";
import type { Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { MSG_ERRO_API } from "../../service/api";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";

export function ManutencaoForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [manutencao, setManutencao] = useState<Manutencao>({ ...manutencaoInicial, data: hoje() });
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        veiculoService.listar().then(setVeiculos).catch(() => setErroApi(MSG_ERRO_API));
        if (id) manutencaoService.buscarPorId(id).then(setManutencao).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setManutencao((p) => ({ ...p, [name]: valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: Record<string, string> = {};
        if (!manutencao.veiculoId) novosErros.veiculoId = "Selecione o veículo.";
        if (!manutencao.data) novosErros.data = "Informe a data.";
        if (!manutencao.descricao.trim()) novosErros.descricao = "Informe a descrição.";
        if (manutencao.valor < 0) novosErros.valor = "O valor não pode ser negativo.";
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) return;
        try {
            if (id) await manutencaoService.atualizar(id, manutencao);
            else await manutencaoService.criar(manutencao);
            navigate(`/manutencoes?veiculoId=${manutencao.veiculoId}`, { state: { msg: id ? "Manutenção atualizada com sucesso." : "Manutenção registrada com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar manutenção" : "Nova manutenção"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <Select label="Veículo" name="veiculoId" value={manutencao.veiculoId} onChange={handleChange} error={erros.veiculoId}
                    options={veiculos.map((v) => ({ value: v.id ?? "", label: v.placa }))} />
                <Input label="Data" name="data" type="date" value={manutencao.data} onChange={handleChange} error={erros.data} />
                <TextArea label="Descrição" name="descricao" value={manutencao.descricao} onChange={handleChange} error={erros.descricao} />
                <Input label="Valor (R$)" name="valor" type="number" value={manutencao.valor} onChange={handleChange} error={erros.valor} min={0} />
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/manutencoes")} />
                </div>
            </form>
        </Card>
    );
}
