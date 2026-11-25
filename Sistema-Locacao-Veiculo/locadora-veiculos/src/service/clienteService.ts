import { criarCrud } from "./crud";
import type { Cliente } from "../models/Cliente";

export const clienteService = criarCrud<Cliente>("/clientes");
