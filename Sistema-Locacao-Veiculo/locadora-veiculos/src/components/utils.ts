import type { ChangeEvent } from "react";

export type CampoChange = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** Lê o campo alterado; campos type="number" viram number. */
export function lerCampo(e: CampoChange): { name: string; valor: string | number } {
  const { name, value, type } = e.target;
  return { name, valor: type === "number" ? Number(value) : value };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(valor?: string): string {
  if (!valor) return "-";
  if (valor.length === 10) {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  return new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function dois(n: number): string {
  return String(n).padStart(2, "0");
}

/** Data de hoje no formato yyyy-MM-dd. */
export function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/** Data/hora atual no formato do input datetime-local. */
export function agoraLocal(): string {
  const d = new Date();
  return `${hoje()}T${dois(d.getHours())}:${dois(d.getMinutes())}`;
}
