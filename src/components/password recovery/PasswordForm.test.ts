/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import PasswordForm from "./PasswordForm"
import { resetPassword } from "@/services/AuthServices"
import React from "react"
import type { AxiosResponse } from "axios"

// Mock del servicio
jest.mock("@/services/AuthServices")
const mockResetPassword = resetPassword as jest.MockedFunction<
  typeof resetPassword
>

// Mock de react-router-dom para capturar navegación
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}))

// Helper para renderizar con providers necesarios
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, component)
    )
  )
}

// Helper para crear respuestas mock de Axios
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {
    headers: {} as any,
  } as any,
})

// Contraseña válida que cumple con el schema
const VALID_PASSWORD = "Password123"

describe("PasswordForm Component", () => {
  const testEmail = "test@example.com"

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "log").mockImplementation()
    jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ========== Tests de Renderizado Inicial ==========
  describe("Renderizado inicial", () => {
    it("debe renderizar todos los elementos del formulario", () => {
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      expect(screen.getByText("Recuperar contraseña")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText("Confirmar contraseña")
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument()
    })

    it("debe mostrar los checkboxes de mostrar contraseña", () => {
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const checkboxes = screen.getAllByLabelText("Mostrar contraseña")
      expect(checkboxes).toHaveLength(2)
    })

    it("debe mostrar el mensaje del footer", () => {
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      expect(
        screen.getByText("Si tienes problemas comunicate con nosotros.")
      ).toBeInTheDocument()
    })
  })

  // ========== Tests de Validación ==========
  describe("Validaciones del formulario", () => {
    it("debe mostrar error cuando la contraseña está vacía", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getAllByText("La contraseña es requerida").length
        ).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando la contraseña es muy corta", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, "Pass1")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña debe tener al menos 8 caracteres")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando la contraseña no tiene mayúscula", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            "La contraseña debe tener al menos una letra mayúscula"
          )
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando la contraseña no tiene número", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, "Password")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña debe tener al menos un número")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando las contraseñas no coinciden", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, "DifferentPass123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Las contraseñas no coinciden")
        ).toBeInTheDocument()
      })
    })

    it("debe aplicar estilos de error cuando hay errores de validación", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        const passwordInput = screen.getByPlaceholderText("Contraseña")
        expect(passwordInput).toHaveClass("border-red-error")
      })
    })
  })

  // ========== Tests de Funcionalidad Mostrar Contraseña ==========
  describe("Funcionalidad mostrar contraseña", () => {
    it('debe cambiar el tipo de input de contraseña al activar "Mostrar contraseña"', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const checkboxes = screen.getAllByLabelText("Mostrar contraseña")

      expect(passwordInput).toHaveAttribute("type", "password")

      await user.click(checkboxes[0])

      expect(passwordInput).toHaveAttribute("type", "text")
    })

    it("debe volver a ocultar la contraseña al desactivar el checkbox", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const checkboxes = screen.getAllByLabelText("Mostrar contraseña")

      await user.click(checkboxes[0])
      expect(passwordInput).toHaveAttribute("type", "text")

      await user.click(checkboxes[0])
      expect(passwordInput).toHaveAttribute("type", "password")
    })

    it('debe cambiar el tipo de input de confirmar contraseña al activar "Mostrar contraseña"', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const checkboxes = screen.getAllByLabelText("Mostrar contraseña")

      expect(confirmPasswordInput).toHaveAttribute("type", "password")

      await user.click(checkboxes[1])

      expect(confirmPasswordInput).toHaveAttribute("type", "text")
    })

    it("los checkboxes de mostrar contraseña deben ser independientes", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const checkboxes = screen.getAllByLabelText("Mostrar contraseña")

      // Activar solo el primer checkbox
      await user.click(checkboxes[0])

      expect(passwordInput).toHaveAttribute("type", "text")
      expect(confirmPasswordInput).toHaveAttribute("type", "password")

      // Activar el segundo checkbox
      await user.click(checkboxes[1])

      expect(passwordInput).toHaveAttribute("type", "text")
      expect(confirmPasswordInput).toHaveAttribute("type", "text")
    })
  })

  // ========== Tests de Interacción ==========
  describe("Interacción del usuario", () => {
    it("debe permitir escribir en el input de contraseña", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText(
        "Contraseña"
      ) as HTMLInputElement
      await user.type(passwordInput, VALID_PASSWORD)

      expect(passwordInput.value).toBe(VALID_PASSWORD)
    })

    it("debe permitir escribir en el input de confirmar contraseña", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      ) as HTMLInputElement
      await user.type(confirmPasswordInput, VALID_PASSWORD)

      expect(confirmPasswordInput.value).toBe(VALID_PASSWORD)
    })
  })

  // ========== Tests de Reseteo de Contraseña ==========
  describe("Proceso de reseteo de contraseña", () => {
    it("debe llamar a resetPassword con los datos correctos", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
        const firstCallArgs = mockResetPassword.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: testEmail,
          password: VALID_PASSWORD,
        })
      })
    })

    it("debe mostrar estado de carga durante el reseteo", async () => {
      const user = userEvent.setup()
      let resolveReset: any
      mockResetPassword.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveReset = resolve
          })
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()

      resolveReset(createMockResponse([{ id: 1, email: testEmail }]))
    })

    it("debe mostrar pantalla de éxito cuando el reseteo es exitoso", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Tu contraseña fue actualizada de forma exitosa")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar botón para ir al login en pantalla de éxito", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /ir al inicio de sesión/i })
        ).toBeInTheDocument()
      })
    })

    it("debe navegar al login cuando se hace clic en el botón", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /ir al inicio de sesión/i })
        ).toBeInTheDocument()
      })

      const loginButton = screen.getByRole("button", {
        name: /ir al inicio de sesión/i,
      })
      await user.click(loginButton)

      expect(mockNavigate).toHaveBeenCalledWith("/login")
    })

    it("debe mostrar error cuando la respuesta tiene data vacía", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(createMockResponse([]))

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockRejectedValue(new Error("Network error"))

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Error en la autenticación")
        ).toBeInTheDocument()
      })
    })

    it("debe limpiar el error al volver a intentar", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValueOnce(createMockResponse([]))

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      // Primer intento - error
      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos")
        ).toBeInTheDocument()
      })

      // Limpiar inputs
      await user.clear(passwordInput)
      await user.clear(confirmPasswordInput)

      // Segundo intento - exitoso
      mockResetPassword.mockResolvedValueOnce(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledTimes(2)
      })

      // El error debería limpiarse
      await waitFor(() => {
        expect(
          screen.queryByText("Email o contraseña incorrectos")
        ).not.toBeInTheDocument()
      })
    })
  })

  // ========== Tests de Accesibilidad ==========
  describe("Accesibilidad", () => {
    it("debe tener inputs accesibles con placeholders apropiados", () => {
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      expect(screen.getByPlaceholderText("Contraseña")).toHaveAttribute(
        "type",
        "password"
      )
      expect(
        screen.getByPlaceholderText("Confirmar contraseña")
      ).toHaveAttribute("type", "password")
    })

    it("debe tener un submit button con texto apropiado", () => {
      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      expect(submitButton).toHaveAttribute("type", "submit")
    })

    it("debe permitir enviar el formulario con Enter", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )

      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, `${VALID_PASSWORD}{Enter}`)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
      })
    })
  })

  // ========== Test de Integración ==========
  describe("Flujo completo", () => {
    it("debe completar el flujo exitoso: escribir contraseñas → submit → reseteo exitoso → pantalla de éxito → navegar al login", async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(PasswordForm, { email: testEmail })
      )

      // 1. Escribir contraseñas
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText(
        "Confirmar contraseña"
      )
      await user.type(passwordInput, VALID_PASSWORD)
      await user.type(confirmPasswordInput, VALID_PASSWORD)

      // 2. Submit
      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      // 3. Verificar llamada a API
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
        const firstCallArgs = mockResetPassword.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: testEmail,
          password: VALID_PASSWORD,
        })
      })

      // 4. Verificar pantalla de éxito
      await waitFor(() => {
        expect(
          screen.getByText("Tu contraseña fue actualizada de forma exitosa")
        ).toBeInTheDocument()
      })

      // 5. Navegar al login
      const loginButton = screen.getByRole("button", {
        name: /ir al inicio de sesión/i,
      })
      await user.click(loginButton)

      expect(mockNavigate).toHaveBeenCalledWith("/login")
    })
  })
})
