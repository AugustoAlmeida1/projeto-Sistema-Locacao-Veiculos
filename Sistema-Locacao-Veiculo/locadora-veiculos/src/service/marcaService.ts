import { criarCrud } from "./crud";
import type { Marca } from "../models/Marca";

export const marcaService = criarCrud<Marca>("/marcas");