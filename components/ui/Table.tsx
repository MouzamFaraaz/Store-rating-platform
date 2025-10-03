
import React, { useState, useMemo } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

const SortIcon: React.FC<{ direction?: SortDirection }> = ({ direction }) => {
  if (!direction) return <span className="text-gray-400">↕</span>;
  return direction === 'asc' ? <span className="text-gray-600">▲</span> : <span className="text-gray-600">▼</span>;
};

export function Table<T extends { id: string },>({ columns, data }: TableProps<T>): React.ReactElement {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.sortable ? (
                  <button
                    onClick={() => typeof column.accessor === 'string' && requestSort(column.accessor as keyof T)}
                    className="flex items-center space-x-1 focus:outline-none"
                  >
                    <span>{column.header}</span>
                    <SortIcon direction={sortConfig?.key === column.accessor ? sortConfig.direction : undefined} />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {typeof column.accessor === 'function' ? column.accessor(item) : String(item[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
