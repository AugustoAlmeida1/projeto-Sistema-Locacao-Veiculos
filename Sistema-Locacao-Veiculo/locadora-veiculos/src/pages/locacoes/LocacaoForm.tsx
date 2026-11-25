import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { agoraLocal, formatarData, formatarMoeda, hoje, lerCampo } from "../../components/utils";
import type { CampoChange } from "../../components/utils";
import type { Categoria } from "../../models/Categoria";
import type { Cliente } from "../../models/Cliente";
import { gerarTermos } from "../../models/Contrato";
import { calcularDiarias, calcularValorLocacao, locacaoInicial } from "../../models/Locacao";
import type { Locacao } from "../../models/Locacao";
import type { Modelo } from "../../models/Modelo";
import { calcularStatusVeiculo } from "../../models/Veiculo";
import type { Veiculo } from "../../models/Veiculo";
import { opcoesCombustivel } from "../../models/Vistoria";
import type { NivelCombustivel } from "../../models/Vistoria";
import { MSG_ERRO_API } from "../../service/api";
import { categoriaService } from "../../service/categoriaService";
import { clienteService } from "../../service/clienteService";
import { contratoService } from "../../service/contratoService";
import { locacaoService } from "../../service/locacaoService";
import { manutencaoService } from "../../service/manutencaoService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

export function LocacaoForm() {
    const navigate = useNavigate();
    const [locacao, setLocacao] = useState<Locacao>({ ...locacaoInicial, dataRetirada: agoraLocal() });
    const [nivel, setNivel] = useState<NivelCombustivel>("CHEIO");
    const [observacoes, setObservacoes] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        Promise.all([
            clienteService.listar(),
            veiculoService.listar(),
            modeloService.listar(),
            categoriaService.listar(),
            locacaoService.listar(),
            manutencaoService.listar(),
        ])
            .then(([cli, vei, mod, cat, loc, man]) => {
                setClientes(cli);
                // RF07: somente veículos disponíveis podem ser locados
                setVeiculos(vei.filter((v) => calcularStatusVeiculo(v, loc, man, hoje()) === "DISPONIVEL"));
                setModelos(mod);
                setCategorias(cat);
            })
            .catch(() => setErroApi(MSG_ERRO_API));
    }, []);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setLocacao((p) => ({ ...p, [name]: valor }));
    }

    const veiculo = veiculos.find((v) => v.id === locacao.veiculoId);
    const modelo = modelos.find((m) => m.id === veiculo?.modeloId);
    const categoria = categorias.find((c) => c.id === modelo?.categoriaId);
    const diarias = calcularDiarias(locacao.dataRetirada, locacao.dataDevolucaoPrevista);
    const valorPrevisto = categoria ? calcularValorLocacao(diarias, categoria.valorLocacao) : 0;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: Record<string, string> = {};
        const cliente = clientes.find((c) => c.id === locacao.clienteId);

        if (!locacao.clienteId) novosErros.clienteId = "Selecione o cliente.";
        if (!locacao.veiculoId) novosErros.veiculoId = "Selecione o veículo.";
        if (!locacao.dataRetirada) novosErros.dataRetirada = "Informe a data de retirada.";
        if (!locacao.dataDevolucaoPrevista) novosErros.dataDevolucaoPrevista = "Informe a data de devolução prevista.";

        // RN02
        if (locacao.dataRetirada && locacao.dataDevolucaoPrevista &&
            new Date(locacao.dataDevolucaoPrevista) <= new Date(locacao.dataRetirada)) {
            novosErros.dataDevolucaoPrevista = "A devolução prevista deve ser posterior à retirada.";
        }
        // RN03
        if (cliente && cliente.validadeCnh < hoje()) {
            novosErros.clienteId = "CNH vencida: não é permitido registrar locação para este cliente.";
        }

        try {
            // RN01 (checagem atualizada direto na API)
            if (locacao.veiculoId) {
                const abertas = await locacaoService.listarPor({ veiculoId: locacao.veiculoId, status: "ABERTA" });
                if (abertas.length > 0) novosErros.veiculoId = "Este veículo já possui uma locação em aberto.";
            }
            setErros(novosErros);
            if (Object.keys(novosErros).length > 0 || !veiculo || !cliente) return;

            const criada = await locacaoService.criar({
                ...locacao,
                kmRetirada: veiculo.kmRodado,
                valorTotal: valorPrevisto,
                status: "ABERTA",
            });
            const idLocacao = criada.id ?? "";

            // RF09: contrato gerado automaticamente
            await contratoService.criar({
                numero: `CT-${new Date().getFullYear()}-${idLocacao.toUpperCase()}`,
                dataEmissao: hoje(),
                termos: gerarTermos(cliente.nome, veiculo.placa, formatarData(locacao.dataRetirada), formatarData(locacao.dataDevolucaoPrevista), valorPrevisto),
                locacaoId: idLocacao,
            });
            // RF10: vistoria de retirada
            await vistoriaService.criar({
                tipo: "RETIRADA",
                data: locacao.dataRetirada,
                km: veiculo.kmRodado,
                nivelCombustivel: nivel,
                observacoes,
                locacaoId: idLocacao,
            });
            navigate(`/locacoes/${idLocacao}`, { state: { msg: "Locação registrada. Contrato e vistoria de retirada gerados." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title="Nova locação">
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <Select label="Cliente" name="clienteId" value={locacao.clienteId} onChange={handleChange} error={erros.clienteId}
                            options={clientes.map((c) => ({ value: c.id ?? "", label: c.nome }))} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Select label="Veículo disponível" name="veiculoId" value={locacao.veiculoId} onChange={handleChange} error={erros.veiculoId}
                            options={veiculos.map((v) => ({
                                value: v.id ?? "",
                                label: `${v.placa} - ${modelos.find((m) => m.id === v.modeloId)?.nome ?? ""}`,
                            }))} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Input label="Data de retirada" name="dataRetirada"  value={locacao.dataRetirada} onChange={handleChange} error={erros.dataRetirada} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Input label="Devolução prevista" name="dataDevolucaoPrevista"  value={locacao.dataDevolucaoPrevista} onChange={handleChange} error={erros.dataDevolucaoPrevista} />
                    </div>
                    <div className="col-12 col-md-6">
                        <Select label="Nível de combustível (vistoria de retirada)" name="nivel" value={nivel}
                            onChange={(e) => setNivel(e.target.value as NivelCombustivel)} options={opcoesCombustivel} />
                    </div>
                </div>
                <TextArea label="Observações da vistoria de retirada" name="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

                <div className="alert alert-info">
                    {categoria && diarias > 0
                        ? `${diarias} diária(s) × ${formatarMoeda(categoria.valorLocacao)} (${categoria.nome}) = ${formatarMoeda(valorPrevisto)}`
                        : "Selecione o veículo e as datas para calcular o valor previsto."}
                </div>

                <div className="d-flex gap-2">
                    <Button label="Registrar locação" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/locacoes")} />
                </div>
            </form>
        </Card>
    );
}