import { criarCrud } from "./crud";
import type { Modelo } from "../models/Modelo";

export const modeloService = criarCrud<Modelo>("/modelos");