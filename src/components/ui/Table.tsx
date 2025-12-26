import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  hidden?: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
  rowKey?: keyof T | ((item: T) => string);
  className?: string;
}

export function Table<T>({
  data,
  columns,
  actions,
  rowKey = 'id',
  className = '',
}: TableProps<T>) {
  const getRowKey = (item: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return String(item[rowKey]);
  };

  return (
    <div className={`bg-white rounded-sm border border-slate-200 overflow-x-auto mb-6 ${className}`}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  text-left px-4 py-3 text-sm font-semibold text-slate-900
                  whitespace-nowrap overflow-hidden text-ellipsis
                  ${column.className || ''}
                  ${column.hidden || ''}
                `}
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={getRowKey(item)} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`
                    px-4 py-3
                    ${column.className || ''}
                    ${column.hidden || ''}
                  `}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key] ?? '')}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
