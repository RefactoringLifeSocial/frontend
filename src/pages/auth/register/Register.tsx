import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  registerSchema,
  type RegisterSchema,
} from "@/utils/schemas/registerSchema"
import FormInput from "@/components/ui/FormInput"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/services/AuthServices"

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const { mutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    onSuccess: (response) => {
      if (!response.data || response.data.length === 0) {
        setError("Ocurrió un error al intentar registrar.")
        return
      }
      
      const { password: _, ...user } = response.data
      
      alert(`¡Bienvenido ${user.name}!`)
    },
    onError: (error) => {
      console.error("Error en la autenticación:", error)
      setError("Error en la autenticación")
    },
  })

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  return (
    <>
      <div className="w-full">
        <Link
          className="flex md:hidden items-center p-4 text-gray-600 hover:text-gray-900"
          to="/"
        >
          <Icon icon="mingcute:left-fill" className="size-7 font-bold" />
          <span className="sr-only">Volver</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 lg:gap-8 min-h-screen md:min-h-0">

        <div className="flex flex-col p-2 lg:p-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Registrarse
          </h1>

          {/* Form */}
          <form 
            onSubmit={handleSubmit(({ confirmPassword: _, ...data }) => {
              setError("")
              mutate(data)
            })}
            className="flex flex-col gap-4"
          >
            <FormInput
              type="text"
              placeholder="Nombre completo"
              error={errors.name}
              {...register("name")}
            />
            
            <FormInput
              type="email"
              placeholder="Email"
              error={errors.email}
              {...register("email")}
            />

            <FormInput
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              error={errors.password}
              {...register("password")}
            />

            {/* Confirmar contraseña */}
            <FormInput
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              error={errors.confirmPassword} 
              {...register("confirmPassword")}
            />

            {/* Mostrar contraseña checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold">Mostrar contraseña</span>
            </label>

            {/* Errores en mobile */}
            <div className="md:hidden flex flex-col gap-2">
              {errors.name && <p className="text-red-error text-sm font-bold">{errors.name.message}</p>}
              {errors.email && <p className="text-red-error text-sm font-bold">{errors.email.message}</p>}
              {errors.password && <p className="text-red-error text-sm font-bold">{errors.password.message}</p>}
            </div>

            {/* Error API response */}
            {error && <p className="text-red-error text-sm font-bold">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:loading" className="size-5 animate-spin" />
                  Cargando...
                </div>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>
        </div>
        {/* Login link */}
        <p className="text-center text-sm text-gray-600 border-t border-gray-300 py-6 mx-4">
          Si ya tienes una cuenta,{" "}
          <Link
            to="/login"
            className="font-semibold underline md:no-underline underline-offset-2 hover:underline"
          >
            inicia sesión aquí
          </Link>
        </p>
      </div>
    </>
  )
}

export default Register