import { Loader2 } from 'lucide-react';
import React from 'react';

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
        <div className="animate-pulse">
            <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <div className="text-gray-500 text-lg font-medium">Đang tải dữ liệu...</div>
                <div className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</div>
            </div>
            </div>
        </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key as string} className="p-2">
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
    </div>
  );
};