/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import SendEmailForm from "./SendEmailForm"
import { sendPasswordResetEmail } from "@/services/AuthServices"
import React from "react"
import type { AxiosResponse } from "axios"

// Mock del servicio
jest.mock("@/services/AuthServices")
const mockSendPasswordResetEmail =
  sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>

// Helper para renderizar con providers necesarios
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    React.createElement(QueryClientProvider, { client: queryClient }, component)
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

describe("SendEmailForm Component", () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ========== Tests de Renderizado Básico ==========
  describe("Renderizado inicial", () => {
    it("debe renderizar el título correctamente", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      expect(screen.getByText("Recuperar contraseña")).toBeInTheDocument()
    })

    it("debe renderizar el input de email con placeholder", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
    })

    it("debe renderizar el botón de submit", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument()
    })

    it("debe renderizar el mensaje del footer", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      expect(
        screen.getByText("Si tienes problemas comunicate con nosotros.")
      ).toBeInTheDocument()
    })
  })

  // ========== Tests de Validación ==========
  describe("Validaciones del formulario", () => {
    it("debe mostrar error cuando se envía el formulario sin email", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Correo electrónico inválido")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando el email tiene formato inválido", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "email@invalido")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Correo electrónico inválido")
        ).toBeInTheDocument()
      })
    })

    it("debe aplicar estilos de error cuando hay errores de validación", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText("Email")
        expect(emailInput).toHaveClass("border-red-error")
      })
    })

    it("no debe mostrar error con un email válido", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: "test@example.com" }])
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      await user.type(emailInput, "test@example.com")

      expect(screen.queryByText(/email incorrecto/i)).not.toBeInTheDocument()
    })
  })

  // ========== Tests de Interacción ==========
  describe("Interacción del usuario", () => {
    it("debe permitir escribir en el input de email", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText(
        "Email"
      ) as HTMLInputElement
      await user.type(emailInput, "test@example.com")

      expect(emailInput.value).toBe("test@example.com")
    })
  })

  // ========== Tests de Llamadas a la API ==========
  describe("Proceso de envío de email", () => {
    it("debe llamar a sendPasswordResetEmail con el email correcto", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: "test@example.com" }])
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled()
        const firstCallArgs = mockSendPasswordResetEmail.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: "test@example.com",
        })
      })
    })

    it("debe llamar a onSuccess cuando la respuesta es exitosa", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: "test@example.com" }])
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith("test@example.com")
      })
    })

    it("debe mostrar 'Email incorrecto' cuando la respuesta tiene data vacía", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(createMockResponse([]))

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Email incorrecto")).toBeInTheDocument()
      })
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockRejectedValue(new Error("Network error"))

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("No se encontro el email")).toBeInTheDocument()
      })
    })

    it("debe limpiar el error al volver a intentar el envío", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValueOnce(createMockResponse([]))

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      // Primer intento - error
      await user.type(emailInput, "wrong@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Email incorrecto")).toBeInTheDocument()
      })

      // Limpiar input
      await user.clear(emailInput)

      // Segundo intento - exitoso
      mockSendPasswordResetEmail.mockResolvedValueOnce(
        createMockResponse([{ id: 1, email: "test@example.com" }])
      )

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(2)
      })

      // El error debería limpiarse después del segundo envío
      await waitFor(() => {
        expect(screen.queryByText("Email incorrecto")).not.toBeInTheDocument()
      })
    })
  })

  // ========== Tests de Estados de Carga ==========
  describe("Estados de carga", () => {
    it("debe mostrar estado de carga durante el envío", async () => {
      const user = userEvent.setup()
      let resolveSend: any
      mockSendPasswordResetEmail.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSend = resolve
          })
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      // Verificar que muestra el estado de carga
      await waitFor(() => {
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()

      // Resolver la promesa
      resolveSend(createMockResponse([{ id: 1, email: "test@example.com" }]))
    })

    it("debe deshabilitar el botón durante la carga", async () => {
      const user = userEvent.setup()
      let resolveSend: any
      mockSendPasswordResetEmail.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSend = resolve
          })
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()

      // Resolver la promesa
      resolveSend(createMockResponse([{ id: 1, email: "test@example.com" }]))

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  // ========== Tests de Accesibilidad ==========
  describe("Accesibilidad", () => {
    it("debe tener input accesible con placeholder apropiado", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      expect(screen.getByPlaceholderText("Email")).toHaveAttribute(
        "type",
        "email"
      )
    })

    it("debe tener un submit button con texto apropiado", () => {
      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      expect(submitButton).toHaveAttribute("type", "submit")
    })

    it("debe permitir enviar el formulario con Enter", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: "test@example.com" }])
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      const emailInput = screen.getByPlaceholderText("Email")

      await user.type(emailInput, "test@example.com{Enter}")

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled()
      })
    })
  })

  // ========== Test de Integración ==========
  describe("Flujo completo", () => {
    it("debe completar el flujo exitoso: escribir email → submit → llamada exitosa → onSuccess", async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: "success@example.com" }])
      )

      renderWithProviders(
        React.createElement(SendEmailForm, { onSuccess: mockOnSuccess })
      )

      // 1. Escribir email
      const emailInput = screen.getByPlaceholderText("Email")
      await user.type(emailInput, "success@example.com")

      // 2. Submit
      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      // 3. Verificar llamada a API
      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled()
        const firstCallArgs = mockSendPasswordResetEmail.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: "success@example.com",
        })
      })

      // 4. Verificar onSuccess
      expect(mockOnSuccess).toHaveBeenCalledWith("success@example.com")
    })
  })
})
