import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs sm:text-sm font-bold">{label}</label>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_black] md:shadow-[4px_4px_0_0_black] focus:outline-none focus:shadow-[1px_1px_0_0_black] transition-shadow rounded-md md:rounded-lg text-sm sm:text-base ${className}`}
      />
    </div>
  );
};

export default Input;
