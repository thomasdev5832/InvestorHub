import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export default function Button({
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    icon,
    iconPosition = "right",
    children,
    ...props
}: ButtonProps) {
    // Base styles for all buttons
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg transition cursor-pointer duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

    // Variant styles
    const variantStyles = {
        primary:
            "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-sm hover:shadow-md focus:ring-sky-500",
        secondary:
            "bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600 shadow-sm hover:shadow-md focus:ring-gray-500",
        outline:
            "bg-transparent text-gray-900 border-2 border-gray-300 hover:border-sky-500 hover:text-sky-600 focus:ring-sky-500",
        ghost:
            "bg-transparent text-gray-900 hover:bg-sky-50 hover:text-sky-600 focus:ring-sky-500",
    };

    // Size styles
    const sizeStyles = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    // Disabled styles
    const disabledStyles = disabled
        ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-sky-500 hover:to-sky-600 hover:bg-gray-900 hover:border-gray-700"
        : "";

    // Icon spacing
    const iconSpacing = children && icon ? (iconPosition === "left" ? "mr-2" : "ml-2") : "";

    return (
        <button
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        ${className}
      `}
            disabled={disabled}
            {...props}
        >
            {icon && iconPosition === "left" && (
                <span className={iconSpacing}>{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
                <span className={iconSpacing}>{icon}</span>
            )}
        </button>
    );
}