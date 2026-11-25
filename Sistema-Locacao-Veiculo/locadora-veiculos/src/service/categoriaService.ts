import { criarCrud } from "./crud";
import type { Categoria } from "../models/Categoria";

export const categoriaService = criarCrud<Categoria>("/categorias");
