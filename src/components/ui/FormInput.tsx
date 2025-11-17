import { Icon } from "@iconify/react"
import { forwardRef } from "react"
import type { FieldError } from "react-hook-form"

interface FormInputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: FieldError
  label?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, label, type = "text", value, ...props }, ref) => {
    // Detectamos si hay valor o si está enfocado
    const hasValue = value != null && value !== ""

    return (
      <div className="relative w-full">
        <div className="relative">
          {/* Input */}
          <input
            ref={ref}
            type={type}
            className={`
              peer w-full bg-transparent border-b-2 pb-2 pt-5 text-gray-900
              focus:outline-none transition-all duration-200 px-2 placeholder:opacity-0
              ${error 
                ? "border-red-error focus:border-red-error" 
                : "border-gray-400 focus:border-violet-main"
              }
            `}
            value={value}
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <label
              className={`
                absolute left-0 top-5 
                text-gray-500 pointer-events-none 
                transition-all duration-200 origin-left px-3
                ${hasValue
                  ? "-translate-y-4 scale-75 text-violet-main"
                  : "translate-y-0 scale-100"
                }
                peer-focus:-translate-y-4
                peer-focus:scale-75 
                peer-focus:text-violet-main
              `}
            >
              {label}
            </label>
          )}

          {/* Icono de error */}
          {error && (
            <div className="group absolute right-0 top-1/2 -translate-y-1/2">
              <Icon icon="mdi:alert-circle" className="size-5 text-red-500 cursor-pointer" />
              <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
                {error.message}
              </div>
            </div>
          )}
        </div>

        {/* Error en móvil */}
        {error && (
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = "FormInput"
export default FormInput