/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import CheckCodeForm from "./CheckCodeForm"
import { sendPasswordResetEmail, verifyCode } from "@/services/AuthServices"
import React from "react"
import type { AxiosResponse } from "axios"

// Mock de los servicios
jest.mock("@/services/AuthServices")
const mockSendPasswordResetEmail =
  sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>
const mockVerifyCode = verifyCode as jest.MockedFunction<typeof verifyCode>

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

describe("CheckCodeForm Component", () => {
  const mockOnSuccess = jest.fn()
  const mockOnBack = jest.fn()
  const testEmail = "test@example.com"

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.spyOn(console, "log").mockImplementation()
    jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ========== Tests de Renderizado Inicial ==========
  describe("Renderizado inicial", () => {
    it("debe renderizar todos los elementos del formulario", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      expect(screen.getByText("¡Gracias!")).toBeInTheDocument()
      expect(
        screen.getByText(/Te enviamos un código de verificación a/i)
      ).toBeInTheDocument()
      expect(screen.getByText(testEmail)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /volver/i })
      ).toBeInTheDocument()
    })

    it("debe renderizar 6 inputs para el código", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")
      expect(inputs).toHaveLength(6)
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("maxLength", "1")
        expect(input).toHaveAttribute("inputMode", "numeric")
      })
    })

    it("debe mostrar el botón de reenviar con el timer inicial", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      expect(screen.getByText("00:60")).toBeInTheDocument()
    })

    it("debe mostrar el enlace para ir al email", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const emailLink = screen.getByRole("link", { name: /ir al email/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute("href", `mailto:${testEmail}`)
    })
  })

  // ========== Tests de Interacción con Inputs ==========
  describe("Interacción con inputs de código", () => {
    it("debe permitir escribir números en los inputs", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]

      await user.type(inputs[0], "1")
      expect(inputs[0].value).toBe("1")
    })

    it("no debe permitir escribir letras en los inputs", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]

      await user.type(inputs[0], "a")
      expect(inputs[0].value).toBe("")
    })

    it("debe avanzar automáticamente al siguiente input", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")

      expect(document.activeElement).toBe(inputs[1])
    })

    it("debe retroceder con Backspace cuando el input está vacío", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")

      // Retroceder desde el segundo input
      await user.type(inputs[1], "{Backspace}{Backspace}")

      expect(document.activeElement).toBe(inputs[0])
    })
  })

  // ========== Tests de Funcionalidad de Pegado ==========
  describe("Funcionalidad de pegado", () => {
    it("debe aceptar un código de 6 dígitos pegado", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]

      await user.click(inputs[0])
      await user.paste("123456")

      await waitFor(() => {
        expect(inputs[0].value).toBe("1")
        expect(inputs[1].value).toBe("2")
        expect(inputs[2].value).toBe("3")
        expect(inputs[3].value).toBe("4")
        expect(inputs[4].value).toBe("5")
        expect(inputs[5].value).toBe("6")
      })
    })

    it("debe rechazar un código pegado con menos de 6 dígitos", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.click(inputs[0])
      await user.paste("12345")

      await waitFor(() => {
        expect(
          screen.getByText("Por favor, pega un código válido de 6 dígitos")
        ).toBeInTheDocument()
      })
    })

    it("debe rechazar un código pegado con letras", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.click(inputs[0])
      await user.paste("12a456")

      await waitFor(() => {
        expect(
          screen.getByText("Por favor, pega un código válido de 6 dígitos")
        ).toBeInTheDocument()
      })
    })
  })

  // ========== Tests de Verificación de Código ==========
  describe("Verificación de código", () => {
    it("debe verificar automáticamente cuando se completa el código", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(mockVerifyCode).toHaveBeenCalled()
        const firstCallArgs = mockVerifyCode.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: testEmail,
          code: "123456",
        })
      })
    })

    it("debe llamar a onSuccess cuando el código es correcto", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith("123456")
      })
    })

    it("debe mostrar error cuando el código es incorrecto", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(createMockResponse([]))

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(
          screen.getByText("Código incorrecto. Intenta de nuevo.")
        ).toBeInTheDocument()
      })
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it("debe limpiar los inputs cuando el código es incorrecto", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(createMockResponse([]))

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(
          screen.getByText("Código incorrecto. Intenta de nuevo.")
        ).toBeInTheDocument()
      })

      inputs.forEach((input) => {
        expect(input.value).toBe("")
      })
    })

    it("debe mostrar estado de carga durante la verificación", async () => {
      const user = userEvent.setup({ delay: null })
      let resolveVerify: any
      mockVerifyCode.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveVerify = resolve
          })
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(screen.getByText("Verificando código...")).toBeInTheDocument()
      })

      resolveVerify(createMockResponse([{ id: 1, email: testEmail }]))
    })

    it("debe deshabilitar los inputs durante la verificación", async () => {
      const user = userEvent.setup({ delay: null })
      let resolveVerify: any
      mockVerifyCode.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveVerify = resolve
          })
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        inputs.forEach((input) => {
          expect(input).toBeDisabled()
        })
      })

      resolveVerify(createMockResponse([{ id: 1, email: testEmail }]))
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockRejectedValue(new Error("Network error"))

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      await waitFor(() => {
        expect(
          screen.getByText("Error al verificar el código. Intenta de nuevo.")
        ).toBeInTheDocument()
      })
    })
  })

  // ========== Tests de Timer y Reenvío ==========
  describe("Timer y funcionalidad de reenvío", () => {
    it("debe disminuir el timer cada segundo", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      expect(screen.getByText("00:60")).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(screen.getByText("00:59")).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(screen.getByText("00:58")).toBeInTheDocument()
    })

    it("debe habilitar el botón de reenviar cuando el timer llega a 0", () => {
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const resendButton = screen.getByRole("button", { name: /00:60/i })
      expect(resendButton).toBeDisabled()

      act(() => {
        jest.advanceTimersByTime(60000)
      })

      expect(screen.getByText("Reenviar código")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /reenviar código/i })
      ).not.toBeDisabled()
    })

    it("debe reenviar el código cuando se hace clic en el botón", async () => {
      const user = userEvent.setup({ delay: null })
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      // Avanzar el timer hasta que se pueda reenviar
      act(() => {
        jest.advanceTimersByTime(60000)
      })

      const resendButton = screen.getByRole("button", {
        name: /reenviar código/i,
      })
      await user.click(resendButton)

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled()
        const firstCallArgs = mockSendPasswordResetEmail.mock.calls[0][0]
        expect(firstCallArgs).toEqual({ email: testEmail })
      })
    })

    it("debe reiniciar el timer después de reenviar el código", async () => {
      const user = userEvent.setup({ delay: null })
      mockSendPasswordResetEmail.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      // Avanzar el timer
      act(() => {
        jest.advanceTimersByTime(60000)
      })

      const resendButton = screen.getByRole("button", {
        name: /reenviar código/i,
      })
      await user.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText("00:60")).toBeInTheDocument()
      })
    })

    it("debe mostrar estado de carga al reenviar", async () => {
      const user = userEvent.setup({ delay: null })
      let resolveSend: any
      mockSendPasswordResetEmail.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSend = resolve
          })
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      act(() => {
        jest.advanceTimersByTime(60000)
      })

      const resendButton = screen.getByRole("button", {
        name: /reenviar código/i,
      })
      await user.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText("Enviando...")).toBeInTheDocument()
      })

      resolveSend(createMockResponse([{ id: 1, email: testEmail }]))
    })

    it("debe mostrar error cuando falla el reenvío", async () => {
      const user = userEvent.setup({ delay: null })
      mockSendPasswordResetEmail.mockRejectedValue(new Error("Network error"))

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      act(() => {
        jest.advanceTimersByTime(60000)
      })

      const resendButton = screen.getByRole("button", {
        name: /reenviar código/i,
      })
      await user.click(resendButton)

      await waitFor(() => {
        expect(
          screen.getByText("Error al reenviar el código. Intenta de nuevo.")
        ).toBeInTheDocument()
      })
    })
  })

  // ========== Tests de Navegación ==========
  describe("Navegación", () => {
    it("debe llamar a onBack cuando se hace clic en el botón volver", async () => {
      const user = userEvent.setup({ delay: null })
      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const backButton = screen.getByRole("button", { name: /volver/i })
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalled()
    })
  })

  // ========== Test de Integración ==========
  describe("Flujo completo", () => {
    it("debe completar el flujo exitoso: escribir código → verificación automática → onSuccess", async () => {
      const user = userEvent.setup({ delay: null })
      mockVerifyCode.mockResolvedValue(
        createMockResponse([{ id: 1, email: testEmail }])
      )

      renderWithProviders(
        React.createElement(CheckCodeForm, {
          onSuccess: mockOnSuccess,
          onBack: mockOnBack,
          email: testEmail,
        })
      )

      const inputs = screen.getAllByRole("textbox")

      // 1. Escribir código completo
      await user.type(inputs[0], "1")
      await user.type(inputs[1], "2")
      await user.type(inputs[2], "3")
      await user.type(inputs[3], "4")
      await user.type(inputs[4], "5")
      await user.type(inputs[5], "6")

      // 2. Verificar llamada a API
      await waitFor(() => {
        expect(mockVerifyCode).toHaveBeenCalled()
        const firstCallArgs = mockVerifyCode.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: testEmail,
          code: "123456",
        })
      })

      // 3. Verificar onSuccess
      expect(mockOnSuccess).toHaveBeenCalledWith("123456")
    })
  })
})
