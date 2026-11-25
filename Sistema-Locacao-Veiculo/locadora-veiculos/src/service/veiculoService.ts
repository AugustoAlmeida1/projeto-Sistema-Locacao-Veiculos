import { criarCrud } from "./crud";
import type { Veiculo } from "../models/Veiculo";

export const veiculoService = criarCrud<Veiculo>("/veiculos");
