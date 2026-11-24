

//Propriedades do table
import type { ReactNode } from "react";
import { Button } from "../../components/Button"

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T extends { id?: string }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  /** Botões extras por linha (ex.: Detalhes, Devolução). */
  acoes?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export function Table<T extends { id?: string }>({ columns, data, onEdit, onDelete, acoes, emptyMessage = "Nenhum registro encontrado." }: TableProps<T>) {
  const temAcoes = Boolean(onEdit || onDelete || acoes);
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
            {temAcoes && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (temAcoes ? 1 : 0)} className="text-center text-muted">{emptyMessage}</td>
            </tr>
          )}
          {data.map((item, i) => (
            <tr key={item.id ?? i}>
              {columns.map((c) => (
                <td key={c.header}>{c.render(item)}</td>
              ))}
              {temAcoes && (
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {acoes && acoes(item)}
                    {onEdit && <Button label="Editar" variant="warning"  onClick={() => onEdit(item)} />}
                    {onDelete && <Button label="Excluir" variant="danger"  onClick={() => onDelete(item)} />}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

