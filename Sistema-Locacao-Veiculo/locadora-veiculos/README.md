# Sistema de Locação de Veículos

**Aluno(s):** Augusto Carlos Almeida
**Disciplina:** Tecnologia de Construção de Software — PUC Goiás (N2)

Aplicação web para gerenciar uma locadora: frota (marcas, categorias, modelos, veículos, manutenções), clientes e todo o ciclo da locação (contrato, vistorias, pagamentos, devolução e nota fiscal).

**Tecnologias:** React · TypeScript (sem `any`) · Vite · React Router · Bootstrap · Axios · JSON Server

## Como executar

```bash
npm install
npm run server   # API em http://localhost:3001 (terminal 1)
npm run dev      # aplicação em http://localhost:5173 (terminal 2)
```

## Estrutura

```
db.json                 # dados de exemplo (uma coleção por entidade do MER)
src/
├── components/         # Button, Input, Select, TextArea, Table<T>, Modal, Alert, Navbar, Card, Badge e utils(para guardar funções que  várias telas utilizam)
├── models/             # interface + valores iniciais + helpers tipados por entidade
├── pages/              # Home e uma pasta por funcionalidade (list/form)
├── routes/             # rotas
├── service/            # api.ts (axios), crud.ts (CRUD genérico tipado) e um serviço por entidade
├── App.tsx             # a moldura da aplicação, com menu no topo e a área onde as telas aparecem.
└── main.tsx            # ponto de entrada. Liga o React ao HTML, ativa o BrowserRouter e carrega o Bootstrap.
```

## Regras implementadas

| Código | Onde |
|---|---|
| RF01–RF06 | CRUD de marcas, categorias, modelos, veículos, manutenções e clientes (`pages/*`) |
| RF07–RF08 | `LocacaoForm` — só lista veículos disponíveis; valor = diárias × valor da categoria |
| RF09–RF10 | `LocacaoForm` — gera contrato (`CT-ano-id`) e vistoria de retirada ao salvar |
| RF11 | `DevolucaoForm` — vistoria de devolução, recálculo do valor e atualização do km do veículo |
| RF12–RF13 | `LocacaoDetalhe` — vários pagamentos e emissão de nota fiscal (máx. 1 por locação) |
| RF14–RF16 | `LocacaoList` (filtros), `LocacaoDetalhe`, `VeiculoList` (Disponível / Locado / Em manutenção) |
| RN01–RN05 | validações em `LocacaoForm`, `DevolucaoForm` e `LocacaoDetalhe` |
| RN06 | exclusão bloqueada com mensagem quando há dependentes (todas as `*List`) |

Observação: um veículo aparece como **Em manutenção** quando existe manutenção registrada com a data de hoje.

## Prints das telas

_Adicione aqui os prints: Home, listagem de veículos, nova locação, detalhes da locação, devolução._
