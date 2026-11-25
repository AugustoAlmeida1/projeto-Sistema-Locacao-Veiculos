import { criarCrud } from "./crud";
import type { Contrato } from "../models/Contrato";

export const contratoService = criarCrud<Contrato>("/contratos");