import { Icon } from "@iconify/react"
import { forwardRef } from "react"
import type { FieldError } from "react-hook-form"

interface FormInputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: FieldError
  label?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, type = "text", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="relative">
          {/* Input */}
          <input
            ref={ref}
            type={type}
            className={`
              peer w-full bg-transparent border-b-2 pb-2 pt-5 text-gray-900
              focus:outline-none transition-all duration-200 px-2 focus:placeholder:-translate-y-6
              ${error 
                ? "border-red-error focus:border-red-error" 
                : "border-gray-400 focus:border-violet-main"
              }
            `}
            {...props}
          />

          {/* Icono de error y tooltip a la derecha (visible en desktop) */}
          {error && (
            <div className="group absolute right-0 top-1/2 -translate-y-1/2">
              <Icon icon="mdi:alert-circle" className="size-5 text-red-500 cursor-pointer" />
              <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
                {error.message}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = "FormInput"
export default FormInput