import { criarCrud } from "./crud";
import type { Manutencao } from "../models/Manutencao";

export const manutencaoService = criarCrud<Manutencao>("/manutencoes");