import { Icon } from "@iconify/react"
import { forwardRef } from "react"
import type { FieldError } from "react-hook-form"

interface FormInputProps extends React.ComponentPropsWithoutRef<"input"> {
  icon: string
  error?: FieldError
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ icon, error, type = "text", ...props }, ref) => {
    return (
      <div className="relative">
        {/* Icono a la izquierda */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <Icon icon={icon} className="size-5" />
        </div>

        {/* Icono de error y tooltip a la derecha (visible en desktop) */}
        {error && (
          <div className="group hidden md:block">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-error">
              <Icon icon="mdi:alert-circle" className="size-5" />
            </div>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {error.message}
            </div>
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`w-full h-14 pl-12 pr-4 border rounded-lg text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 ${
            error
              ? "border-red-error focus:ring-red-error"
              : "border-gray-300 focus:ring-purple-500"
          }`}
          {...props}
        />
      </div>
    )
  }
)

FormInput.displayName = "FormInput"

export default FormInput