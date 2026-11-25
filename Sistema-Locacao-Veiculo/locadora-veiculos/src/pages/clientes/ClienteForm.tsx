import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { lerCampo } from "../../components/utils";
import type { CampoChange } from "../../components/utils";
import { clienteInicial } from "../../models/Cliente";
import type { Cliente } from "../../models/Cliente";
import { MSG_ERRO_API } from "../../service/api";
import { clienteService } from "../../service/clienteService";

export function ClienteForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState<Cliente>(clienteInicial);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [erroApi, setErroApi] = useState("");

    useEffect(() => {
        if (id) clienteService.buscarPorId(id).then(setCliente).catch(() => setErroApi(MSG_ERRO_API));
    }, [id]);

    function handleChange(e: CampoChange) {
        const { name, valor } = lerCampo(e);
        setCliente((p) => ({ ...p, [name]: valor }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const novosErros: Record<string, string> = {};
        if (!cliente.nome.trim()) novosErros.nome = "Informe o nome.";
        if (!cliente.cpf.trim()) novosErros.cpf = "Informe o CPF.";
        if (!cliente.cnh.trim()) novosErros.cnh = "Informe a CNH.";
        if (!cliente.validadeCnh) novosErros.validadeCnh = "Informe a validade da CNH.";
        if (!cliente.telefone.trim()) novosErros.telefone = "Informe o telefone.";
        if (!cliente.email.includes("@")) novosErros.email = "Informe um e-mail válido.";
        try {
            const existentes = await clienteService.listar();
            if (existentes.some((c) => c.id !== id && c.cpf === cliente.cpf)) novosErros.cpf = "Já existe um cliente com este CPF.";
            if (existentes.some((c) => c.id !== id && c.cnh === cliente.cnh)) novosErros.cnh = "Já existe um cliente com esta CNH.";
            setErros(novosErros);
            if (Object.keys(novosErros).length > 0) return;
            if (id) await clienteService.atualizar(id, cliente);
            else await clienteService.criar(cliente);
            navigate("/clientes", { state: { msg: id ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso." } });
        } catch {
            setErroApi(MSG_ERRO_API);
        }
    }

    return (
        <Card title={id ? "Editar cliente" : "Novo cliente"}>
            {erroApi && <Alert type="danger" message={erroApi} />}
            <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                    <div className="col-12 col-md-6"><Input label="Nome" name="nome" value={cliente.nome} onChange={handleChange} error={erros.nome} /></div>
                    <div className="col-12 col-md-6"><Input label="CPF" name="cpf" value={cliente.cpf} onChange={handleChange} error={erros.cpf} placeholder="000.000.000-00" /></div>
                    <div className="col-12 col-md-6"><Input label="CNH" name="cnh" value={cliente.cnh} onChange={handleChange} error={erros.cnh} /></div>
                    <div className="col-12 col-md-6"><Input label="Validade da CNH" name="validadeCnh"  value={cliente.validadeCnh} onChange={handleChange} error={erros.validadeCnh} /></div>
                    <div className="col-12 col-md-6"><Input label="Telefone" name="telefone"  value={cliente.telefone} onChange={handleChange} error={erros.telefone} /></div>
                    <div className="col-12 col-md-6"><Input label="E-mail" name="email" type="email" value={cliente.email} onChange={handleChange} error={erros.email} /></div>
                </div>
                <Input label="Endereço" name="endereco" value={cliente.endereco} onChange={handleChange} error={erros.endereco} />
                <div className="d-flex gap-2">
                    <Button label="Salvar" type="submit" variant="success" />
                    <Button label="Cancelar" variant="secondary" onClick={() => navigate("/clientes")} />
                </div>
            </form>
        </Card>
    );
}
