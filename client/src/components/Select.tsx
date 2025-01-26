import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs sm:text-sm font-bold">{label}</label>
      <select
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_black] md:shadow-[4px_4px_0_0_black] focus:outline-none focus:shadow-[1px_1px_0_0_black] transition-shadow appearance-none rounded-md md:rounded-lg text-sm sm:text-base ${className}`}
      >
        <option value="">Select your {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
