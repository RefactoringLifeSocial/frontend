import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string("El email es obligatorio")
    .min(1, "El email es obligatorio")
    .email("El email no es valido"),
  password: z
    .string("La contraseña es requerida")
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(30, "La contraseña no puede tener más de 30 caracteres")
    .refine((value) => /[a-z]/.test(value), {
      message: "La contraseña debe tener al menos una letra minúscula",
    })
    .refine((value) => /[A-Z]/.test(value), {
      message: "La contraseña debe tener al menos una letra mayúscula",
    })
    .refine((value) => /[0-9]/.test(value), {
      message: "La contraseña debe tener al menos un número",
    }),
})

export type LoginSchema = z.infer<typeof loginSchema>
