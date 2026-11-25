import { criarCrud } from "./crud";
import type { Pagamento } from "../models/Pagamento";

export const pagamentoService = criarCrud<Pagamento>("/pagamentos");
