import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminColumn<T> = { header: string; cell: (item: T) => ReactNode };

export function AdminTable<T extends { id: string }>({
  items,
  columns,
  onEdit,
  onToggleActive,
  isActive,
  emptyLabel,
}: {
  items: T[];
  columns: AdminColumn<T>[];
  onEdit?: (item: T) => void;
  onToggleActive?: (item: T) => void;
  isActive?: (item: T) => boolean;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyLabel ?? "No hay elementos todavía."}</p>
    );
  }

  const hasActions = !!onEdit || !!onToggleActive;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.header}>{c.header}</TableHead>
            ))}
            {hasActions ? <TableHead className="text-right">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((c) => (
                <TableCell key={c.header}>{c.cell(item)}</TableCell>
              ))}
              {hasActions ? (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onToggleActive ? (
                      <Button size="sm" variant="ghost" onClick={() => onToggleActive(item)}>
                        {isActive?.(item) ? "Desactivar" : "Activar"}
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button size="sm" variant="soft" onClick={() => onEdit(item)}>
                        Editar
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
