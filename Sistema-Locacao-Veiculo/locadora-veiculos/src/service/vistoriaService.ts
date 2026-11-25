import { criarCrud } from "./crud";
import type { Vistoria } from "../models/Vistoria";

export const vistoriaService = criarCrud<Vistoria>("/vistorias");
