import { resetPassword } from "@/services/AuthServices"
import { PasswordRecoverySchema } from "@/utils/schemas/passwordRecoverySchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { useMutation } from "@tanstack/react-query"
import { memo, useState } from "react"
import { useForm } from "react-hook-form"

interface PasswordRecoveryFormData {
  email: string
}
const PasswordForm = ({ email }: PasswordRecoveryFormData) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const { mutate, isPending } = useMutation({
    mutationKey: ["PasswordRecovery"],
    mutationFn: (data: { password: string }) => {
      return resetPassword({ email, password: data.password })
    },
    onSuccess: (response) => {
      if (response.data.length === 0) {
        setError("Email o contraseña incorrectos")
        return
      }
      const user = response.data[0]

      console.log("PasswordRecovery exitoso:", user)
      alert(`¡Bienvenido ${user.name}!`)
    },
    onError: (error) => {
      console.error("Error en la autenticación:", error)
      setError("Error en la autenticación")
    },
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(PasswordRecoverySchema),
  })

  return (
    <>
      <div className="flex flex-col p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-16">
          Recuperar contraseña
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => {
            setError("")
            mutate(data)
          })}
          className="flex flex-col gap-4"
        >
          {/* Password Input */}
          <div className="relative ">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
              <Icon icon="mdi:lock" className="size-5" />
            </div>
            {errors.password && (
              <div className="group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-error">
                  <Icon icon="mdi:alert-circle" className="size-5" />
                </div>
                <div className="absolute right-7 top-2/3 -translate-y-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
                  {errors.password.message}
                </div>
              </div>
            )}

            <input
              type={showPassword ? "text" : "password"}
              className={`w-full h-14 pl-12 pr-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.password
                  ? "focus:ring-red-error border-red-error"
                  : "focus:ring-purple-500"
              }`}
              placeholder="Contraseña"
              {...register("password")}
            />

            {/* Show Confirm Password */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold">Mostrar contraseña</span>
            </label>
          </div>

          {/* Confirm Password Input */}
          <div className="relative ">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
              <Icon icon="mdi:lock" className="size-5" />
            </div>

            {errors.confirmPassword && (
              <div className="group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-error">
                  <Icon icon="mdi:alert-circle" className="size-5" />
                </div>
                <div className="absolute right-7 top-2/3 -translate-y-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
                  {errors.confirmPassword.message}
                </div>
              </div>
            )}

            <input
              type={showPassword ? "text" : "password"}
              className={`w-full h-14 pl-12 pr-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.confirmPassword
                  ? "focus:ring-red-error border-red-error"
                  : "focus:ring-purple-500"
              }`}
              placeholder="Contraseña"
              {...register("confirmPassword")}
            />

            {/* Show Confirm Password */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showConfirmPassword}
                onChange={(e) => setShowConfirmPassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold">Mostrar contraseña</span>
            </label>
          </div>

          {/* Errors */}
          <div className="md:hidden flex flex-col gap-2">
            {errors.confirmPassword && (
              <p className="text-red-error text-sm font-bold">
                {errors.confirmPassword.message}
              </p>
            )}
            {errors.password && (
              <p className="text-red-error text-sm font-bold">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error API response */}
          {error && <p className="text-red-error text-sm font-bold">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Icon icon="mdi:loading" className="size-5 animate-spin" />
                Cargando...
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 border-t border-gray-300 py-6 mx-4">
        Si tienes problemas comunicate con nosotros.
      </p>
    </>
  )
}
export default memo(PasswordForm)
