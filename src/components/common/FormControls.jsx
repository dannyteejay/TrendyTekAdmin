import React from "react";

export const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
        error
          ? "border-red-500 focus:ring-2 focus:ring-red-200"
          : "border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
      } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    {helperText && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
  </div>
);

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  disabled = false,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
        error ? "border-red-500" : "border-gray-300 dark:border-gray-700 focus:border-black"
      }`}
      {...props}
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);