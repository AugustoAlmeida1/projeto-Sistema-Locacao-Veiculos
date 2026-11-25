import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { agoraLocal, formatarMoeda } from "../../components/utils";
import type { Categoria } from "../../models/Categoria";
import { calcularDiarias, calcularValorLocacao } from "../../models/Locacao";
import type { Locacao } from "../../models/Locacao";
import type { Veiculo } from "../../models/Veiculo";
import { opcoesCombustivel } from "../../models/Vistoria";
import type { NivelCombustivel } from "../../models/Vistoria";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";
import { locacaoService } from "../../service/locacaoService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

export function DevolucaoForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [locacao, setLocacao] = useState<Locacao | null>(null);
    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [categoria, setCategoria] = useState<Categoria | null>(null);
    const [dataReal, setDataReal] = useState(agoraLocal());
    const [km, setKm] = useState(0);
    const [nivel, setNivel] = useState<NivelCombustivel>("CHEIO");
    const [observacoes, setObservacoes] = useState("");
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        if (!id) return;
        async function carregar(idLocacao: string) {
            try {
                const loc = await locacaoService.buscarPorId(idLocacao);
                const vei = await veiculoService.buscarPorId(loc.veiculoId);
                const mod = await modeloService.buscarPorId(vei.modeloId);
                const cat = await categoriaService.buscarPorId(mod.categoriaId);
                setLocacao(loc);
                setVeiculo(vei);
                setCategoria(cat);
                setKm(loc.kmRetirada);
            } catch {
                setErroApi(MSG_ERRO_API);
            }
        }
        void carregar(id);
    }, [id]);

    const diarias = locacao ? calcularDiarias(locacao.dataRetirada, dataReal) : 0;
    const valorFinal = categoria ? calcularValorLocacao(diarias, categoria.valorLocacao) : 0;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!id || !locacao || !veiculo) return;
        const novosErros: Record<string, string> = {};
        if (!dataReal) novosErros.dataReal = "Informe a data de devolução.";
        else if (new Date(dataReal) <= new Date(locacao.dataRetirada)) novosErros.dataReal = "A devolução deve ser posterior à retirada.";
        // RN04
        if (km < locacao.kmRetirada) novosErros.km = `O km de devolução não pode ser menor que o km de retirada (${locacao.kmRetirada}).`;
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) return;

        try {
            // RF11: finaliza a locação, recalcula o valor e atualiza o km do veículo
            await locacaoService.atualizar(id, {
                ...locacao,
                dataDevolucaoReal: dataReal,
                kmDevolucao: km,
                valorTotal: valorFinal,
                status: "FINALIZADA",
            });
            await vistoriaService.criar({ tipo: "DEVOLUCAO", data: dataReal, km, nivelCombustivel: nivel, observacoes, locacaoId: id });
            if (veiculo.id) await veiculoService.atualizar(veiculo.id, { ...veiculo, kmRodado: km });
            navigate(`/locacoes/${id}`, { state: { msg: "Devolução registrada e locação finalizada." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    if (locacao && locacao.status !== "ABERTA") {
        return (
            <Card title="Devolução">
                <Alert type="warning" message="Somente locações em aberto podem ser devolvidas." />
                <Button label="Voltar" variant="secondary" onClick={() => navigate("/locacoes")} />
            </Card>
        );
    }

    return (
        <Card title={`Devolução da locação nº ${id}`}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <Input label="Data de devolução real" name="dataReal"  value={dataReal} onChange={(e) => setDataReal(e.target.value)} error={erros.dataReal} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Input label={`Km de devolução (retirada: ${locacao?.kmRetirada ?? 0})`} name="km" type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} error={erros.km} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Select label="Nível de combustível" name="nivel" value={nivel} onChange={(e) => setNivel(e.target.value as NivelCombustivel)} options={opcoesCombustivel} />
                    </div>
                </div>
                <TextArea label="Observações da vistoria de devolução" name="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                <div className="alert alert-info">
                    {categoria && diarias > 0
                        ? `Valor recalculado: ${diarias} diária(s) × ${formatarMoeda(categoria.valorLocacao)} = ${formatarMoeda(valorFinal)}`
                        : "Informe a data de devolução para recalcular o valor."}
                </div>
                <div className="d-flex gap-2">
                    <Button label="Finalizar locação" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/locacoes")} />
                </div>
            </form>
        </Card>
    );
}
