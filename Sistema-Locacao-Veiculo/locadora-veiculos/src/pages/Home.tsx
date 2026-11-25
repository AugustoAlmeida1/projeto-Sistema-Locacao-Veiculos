import { Link } from "react-router-dom";
import { Card } from "../components/Card";

const atalhos: { to: string; titulo: string; texto: string }[] = [
    { to: "/locacoes/nova", titulo: "Nova locação", texto: "Registrar retirada de um veículo." },
    { to: "/locacoes", titulo: "Locações", texto: "Consultar, devolver e emitir nota fiscal." },
    { to: "/veiculos", titulo: "Veículos", texto: "Frota e disponibilidade." },
    { to: "/clientes", titulo: "Clientes", texto: "Cadastro de clientes e CNH." },
];

export function Home() {
    return (
        <>
            <h1 className="mb-4">Sistema de Locação de Veículos</h1>
            <div className="row">
                {atalhos.map((a) => (
                    <div className="col-12 col-md-6" key={a.to}>
                        <Card title={a.titulo}>
                            <p>{a.texto}</p>
                            <Link to={a.to} className="btn btn-primary">Acessar</Link>
                        </Card>
                    </div>
                ))}
            </div>
        </>
    );
}
