'use client';
interface Column<T> { key: keyof T; header: string; render?: (value: T[keyof T], row: T) => React.ReactNode; width?: string; }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; keyField: keyof T; className?: string; emptyMessage?: string; }

export function DataTable<T>({ columns, data, keyField, className = '', emptyMessage = 'No data available' }: DataTableProps<T>) {
  return (
    <div className={['w-full overflow-x-auto', className].join(' ')}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-white/30">{emptyMessage}</td></tr>
          ) : data.map(row => (
            <tr key={String(row[keyField])} className="border-b border-white/5 hover:bg-white/3 transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-3 text-white/80">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default DataTable;
