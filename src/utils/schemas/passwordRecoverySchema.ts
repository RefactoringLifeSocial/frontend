import z from "zod"

export const PasswordRecoverySchema = z
  .object({
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
    confirmPassword: z
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type PasswordRecoverySchemaType = z.infer<typeof PasswordRecoverySchema>

export const emailSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
})