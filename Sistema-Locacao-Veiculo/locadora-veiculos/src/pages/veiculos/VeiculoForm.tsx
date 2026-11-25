import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import type { Modelo } from "../../models/Modelo";
import { veiculoInicial } from "../../models/Veiculo";
import type { Veiculo } from "../../models/Veiculo";
import { MSG_ERRO_API } from "../../service/api";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

export function VeiculoForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [veiculo, setVeiculo] = useState<Veiculo>(veiculoInicial);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        modeloService.listar().then(setModelos).catch(() => setErroApi(MSG_ERRO_API));
        if (id) veiculoService.buscarPorId(id).then(setVeiculo).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setVeiculo((p) => ({ ...p, [name]: name === "placa" || name === "chassi" ? String(valor).toUpperCase() : valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: Record<string, string> = {};
        if (!veiculo.placa.trim()) novosErros.placa = "Informe a placa.";
        if (!veiculo.chassi.trim()) novosErros.chassi = "Informe o chassi.";
        if (!veiculo.cor.trim()) novosErros.cor = "Informe a cor.";
        if (!veiculo.anoFabricacao || veiculo.anoFabricacao < 1990) novosErros.anoFabricacao = "Informe um ano válido.";
        if (veiculo.kmRodado < 0) novosErros.kmRodado = "A quilometragem não pode ser negativa.";
        if (!veiculo.modeloId) novosErros.modeloId = "Selecione o modelo.";
        try {
            const existentes = await veiculoService.listar();
            if (existentes.some((v) => v.id !== id && v.placa === veiculo.placa)) novosErros.placa = "Já existe um veículo com esta placa.";
            if (existentes.some((v) => v.id !== id && v.chassi === veiculo.chassi)) novosErros.chassi = "Já existe um veículo com este chassi.";
            setErros(novosErros);
            if (Object.keys(novosErros).length > 0) return;
            if (id) await veiculoService.atualizar(id, veiculo);
            else await veiculoService.criar(veiculo);
            navigate("/veiculos", { state: { msg: id ? "Veículo atualizado com sucesso." : "Veículo cadastrado com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar veículo" : "Novo veículo"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                    <div className="col-12 col-md-6"><Input label="Placa" name="placa" value={veiculo.placa} onChange={handleChange} error={erros.placa} /></div>
                    <div className="col-12 col-md-6"><Input label="Chassi" name="chassi" value={veiculo.chassi} onChange={handleChange} error={erros.chassi} /></div>
                    <div className="col-12 col-md-4"><Input label="Ano de fabricação" name="anoFabricacao" type="number" value={veiculo.anoFabricacao} onChange={handleChange} error={erros.anoFabricacao} /></div>
                    <div className="col-12 col-md-4"><Input label="Cor" name="cor" value={veiculo.cor} onChange={handleChange} error={erros.cor} /></div>
                    <div className="col-12 col-md-4"><Input label="Km rodado" name="kmRodado" type="number" value={veiculo.kmRodado} onChange={handleChange} error={erros.kmRodado} /></div>
                </div>
                <Select label="Modelo" name="modeloId" value={veiculo.modeloId} onChange={handleChange} error={erros.modeloId}
                    options={modelos.map((m) => ({ value: m.id ?? "", label: `${m.nome} (${m.ano})` }))} />
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/veiculos")} />
                </div>
            </form>
        </Card>
    );
}
