import { Loader2 } from 'lucide-react';
import React from 'react';
import Loading from './loading';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = "Không có dữ liệu",
  className = ""
}: TableProps<T>) => {
  const getValue = (record: T, key: string) => {
    if (key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record);
    }
    return record[key];
  };

  if (loading) {
    return (
        <Loading />
    );
  }

  return (
      <div className={`bg-white rounded-2xl border-2 border-slate-200 overflow-x-auto ${className}`}>
        <table className="w-full table-auto min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="text-left px-6 py-3 font-medium text-slate-700 "
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white ">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={record.id || index} className="transition-colors border-b border-slate-100 hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key as string} className=" px-6 py-3">
                      {column.render 
                        ? column.render(getValue(record, column.key as string), record)
                        : getValue(record, column.key as string)
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
};