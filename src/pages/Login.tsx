import { loginSchema } from "@/utils/schemas/loginSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import AuthLayout from "@/layout/AuthLayout"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { Icon } from "@iconify/react"
import { useState } from "react"
import login from "@/services/AuthServices"
import { useMutation } from "@tanstack/react-query"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (response) => {
      if (response.data.length === 0) {
        setError("Email o contraseña incorrectos")
        return
      }
      const user = response.data[0]

      console.log("Login exitoso:", user)
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
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  })

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 min-h-screen md:min-h-0">
        <Link
          className="flex md:hidden items-center p-4 text-gray-600 hover:text-gray-900"
          to="/"
        >
          <Icon icon="mingcute:left-fill" className="size-7 font-bold" />
          <span className="sr-only">Volver</span>
        </Link>

        <div className="flex flex-col p-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-16">
            Iniciar sesión
          </h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit((data) => {
              mutate(data)
            })}
            className="flex flex-col gap-4"
          >
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                <Icon icon="mdi:person" className="size-5" />
              </div>

              {errors.email && (
                <div className="group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-error">
                    <Icon icon="mdi:alert-circle" className="size-5" />
                  </div>
                  <div className="absolute right-7 top-2/3 -translate-y-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
                    {errors.email.message}
                  </div>
                </div>
              )}

              <input
                className={`w-full h-14 pl-12 pr-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "focus:ring-red-error border-red-error"
                    : "focus:ring-purple-500"
                }`}
                type="email"
                placeholder="Email"
                {...register("email")}
              />
            </div>

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
            </div>

            {/* Remember me checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold">Mostrar contraseña</span>
            </label>

            {/* Errors */}
            <div className="md:hidden flex flex-col gap-2">
              {errors.email && (
                <p className="text-red-error text-sm font-bold">
                  {errors.email.message}
                </p>
              )}
              {errors.password && (
                <p className="text-red-error text-sm font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error API response */}
            {error && (
              <p className="text-red-error text-sm font-bold">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Icon icon="mdi:loading" className="size-5 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Forgot password link */}
            <div className="text-center">
              <a href="#" className="text-sm font-semibold">
                ¿Olvidaste la contraseña?
              </a>
            </div>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600 border-t border-gray-300 py-6 mx-4">
          Si no tienes una cuenta,{" "}
          <Link
            to="/register"
            className="font-semibold underline md:no-underline underline-offset-2 hover:underline"
          >
            regístrate aquí
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
