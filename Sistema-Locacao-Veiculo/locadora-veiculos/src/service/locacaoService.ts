import { criarCrud } from "./crud";
import type { Locacao } from "../models/Locacao";

export const locacaoService = criarCrud<Locacao>("/locacoes");