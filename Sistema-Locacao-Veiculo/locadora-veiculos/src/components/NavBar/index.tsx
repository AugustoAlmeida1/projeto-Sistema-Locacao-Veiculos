

//Propriedades do navbar
import { useState } from "react";
import { NavLink } from "react-router-dom";

const itens: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/marcas", label: "Marcas" },
  { to: "/categorias", label: "Categorias" },
  { to: "/modelos", label: "Modelos" },
  { to: "/veiculos", label: "Veículos" },
  { to: "/manutencoes", label: "Manutenções" },
  { to: "/clientes", label: "Clientes" },
  { to: "/locacoes", label: "Locações" },
];

export function Navbar() {
  const [aberto, setAberto] = useState(false);
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">Locadora</span>
        <button type="button" className="navbar-toggler" aria-label="Menu" onClick={() => setAberto(!aberto)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${aberto ? " show" : ""}`}>
          <ul className="navbar-nav me-auto">
            {itens.map((i) => (
              <li className="nav-item" key={i.to}>
                <NavLink to={i.to} end={i.to === "/"} className="nav-link" onClick={() => setAberto(false)}>
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}