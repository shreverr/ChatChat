import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled} // Pass the disabled prop to the button
      onClick={(e) => {
        props.onClick?.(e);
      }}
      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-white border-2 border-black shadow-[2px_2px_0_0_black] md:shadow-[4px_4px_0_0_black] hover:shadow-[1px_1px_0_0_black] active:shadow-none transition-shadow font-bold text-base sm:text-lg rounded-md md:rounded-lg ${
        disabled
          ? "bg-green-800 cursor-not-allowed" // Disabled styles
          : "bg-[#4CAF50] cursor-pointer" // Enabled styles
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
