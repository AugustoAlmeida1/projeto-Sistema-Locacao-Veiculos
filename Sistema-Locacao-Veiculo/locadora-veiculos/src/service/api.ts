import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
});

export const MSG_ERRO_API =
  "Não foi possível comunicar com a API. Verifique se o JSON Server está rodando (npm run server).";
