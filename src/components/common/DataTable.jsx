import React from "react";

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items to display in this view.",
  emptyIcon = "📄",
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <div className="text-4xl mb-2">{emptyIcon}</div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{emptyTitle}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm text-gray-700 dark:text-gray-300">
            {data.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`py-3.5 px-4 ${col.cellClassName || ""}`}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : typeof col.accessor === "function"
                      ? col.accessor(row)
                      : row[col.accessor] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { DataTable };
export default DataTable;