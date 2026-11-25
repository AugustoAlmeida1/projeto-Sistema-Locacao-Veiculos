import { criarCrud } from "./crud";
import type { NotaFiscal } from "../models/NotaFiscal";

export const notaFiscalService = criarCrud<NotaFiscal>("/notasFiscais");
