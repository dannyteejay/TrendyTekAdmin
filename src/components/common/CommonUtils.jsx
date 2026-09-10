import React from "react";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> entries
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold ${
              currentPage === page ? "bg-black dark:bg-white text-white dark:text-black" : "border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder = "Search...", onClear }) => (
  <div className="relative flex items-center w-full max-w-sm">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm outline-none focus:border-black dark:focus:border-white"
    />
    {value && (
      <button onClick={() => (onClear ? onClear() : onChange(""))} className="absolute right-3 text-gray-400 text-xs">✕</button>
    )}
  </div>
);

export const LoadingSpinner = ({ size = "md" }) => {
  const sizeMap = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-3", lg: "w-12 h-12 border-4" };
  return <div className={`rounded-full border-gray-200 border-t-black dark:border-t-white animate-spin ${sizeMap[size] || sizeMap.md}`} />;
};

export const EmptyState = ({ icon = "📂", title = "No items found", description = "There are no records to show." }) => (
  <div className="py-12 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
    <div className="text-4xl mb-3 select-none">{icon}</div>
    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);