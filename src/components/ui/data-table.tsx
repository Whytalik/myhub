import React from "react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyState?: React.ReactNode;
  prependRow?: React.ReactNode;
  getRowKey?: (item: T) => string | number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  className, 
  emptyState, 
  prependRow,
  getRowKey 
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse font-sans text-sm table-fixed">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column, i) => (
              <th
                key={i}
                style={{ width: column.width }}
                className={`px-4 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal ${
                  column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"
                } ${column.headerClassName || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prependRow}
          {data.length === 0 && !prependRow ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-secondary font-sans italic"
              >
                {emptyState || "No items found"}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const key = getRowKey
                ? getRowKey(item)
                : ((item as Record<string, unknown>).id ?? (item as Record<string, unknown>)._id ?? rowIndex) as string | number;

              return (
                <tr
                  key={key}
                  className="border-b border-border/50 hover:bg-raised/50 transition-colors group"
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      style={{ width: column.width }}
                      className={`px-4 py-3 text-text overflow-hidden ${
                        column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"
                      } ${column.cellClassName || ""}`}
                    >
                      <div className="truncate">
                        {column.cell
                          ? column.cell(item)
                          : (item[column.accessorKey as keyof T] as React.ReactNode)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
