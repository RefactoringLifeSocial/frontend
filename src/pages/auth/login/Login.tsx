import { loginSchema } from "@/utils/schemas/loginSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { memo, useState } from "react"
import useLogin from "@/hooks/auth/useLogin"
import FormInput from "@/components/ui/FormInput"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useLogin()

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Add this for real-time validation
  })

  const loginFunction = handleSubmit(async (values) => {
    try {
      await login(values)
    } catch (error: any) {
      console.error(error)
    }
  })
  return (
    <div className="flex flex-col gap-8 min-h-screen md:min-h-0">
      <div className="flex flex-col gap-6 p-6 justify-center items-center">
        <img src="logo-name.svg" alt="Logo" className="w-40 md:w-18" />
        {/* Form */}
        <form onSubmit={loginFunction} className="flex flex-col gap-4 w-full">
          {/* Email FormInput */}
          <FormInput
            type="email"
            placeholder="Email"
            {...register("email")} // Spreads value, onChange, etc. from Controller
            error={errors.email}
            disabled={loading}
          />

          {/* Password FormInput */}
          <FormInput
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password")}
            error={errors.password}
            disabled={loading}
          />

          {/* Remember me checkbox */}
          <label className="flex items-center justify-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm font-semibold">Mostrar contraseña</span>
          </label>

          {/* Error API response */}
          {error && <p className="text-red-error text-sm font-bold">{error}</p>}

          <div className="flex flex-col gap-2 w-full">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-500"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:loading" className="size-5 animate-spin" />
                  Cargando...
                </div>
              ) : (
                "Login"
              )}
            </button>

            {/* Forgot password link */}
            <Link
              to="/password-recovery"
              className="text-xs font-semibold text-violet-main text-end"
            >
              ¿Olvidaste la contraseña?
            </Link>
          </div>

          <p className="text-xs">
            Al continuar aceptas los{" "}
            <a href="#" className="text-blue-600">
              Términos y Condiciones y Políticas de privacidad de Huellas.
            </a>
          </p>

          {/* Google button */}
          <button
            type="button"
            disabled={loading}
            className="w-full h-14 text-gray-700 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-300"
          >
            <Icon icon="devicon:google" className="size-5" />
            Continuar con Google
          </button>
        </form>
      </div>
    </div>
  )
}

export default memo(Login)
