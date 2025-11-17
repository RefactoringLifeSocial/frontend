/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import Register from "./Register"
import { registerUser } from "@/services/AuthServices"
import React from "react"
import type { AxiosResponse } from "axios"

// Mock del servicio de autenticación
jest.mock("@/services/AuthServices")
const mockRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>

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
const createMockResponse = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 201,
  statusText: "Created",
  headers: {},
  config: {
    headers: {} as any,
  } as any,
})

// Datos válidos que cumplen con el schema
const VALID_NAME = "Usuario de Prueba"
const VALID_EMAIL = "test@example.com"
const VALID_PASSWORD = "Password123"

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "log").mockImplementation()
    jest.spyOn(console, "error").mockImplementation()
    jest.spyOn(window, "alert").mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("Renderizado inicial", () => {
    it("debe renderizar todos los elementos del formulario", () => {
      renderWithProviders(React.createElement(Register))

      expect(screen.getByText("Registrarse")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Confirmar contraseña")).toBeInTheDocument()
      expect(screen.getByLabelText("Mostrar contraseña")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /crear cuenta/i })
      ).toBeInTheDocument()
    })

    it("debe mostrar el enlace de inicio de sesión", () => {
      renderWithProviders(React.createElement(Register))

      const loginLink = screen.getByRole("link", {
        name: /inicia sesión aquí/i,
      })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute("href", "/login")
    })

    it("debe mostrar el botón de volver en mobile", () => {
      renderWithProviders(React.createElement(Register))

      const backButton = screen.getByRole("link", { name: /volver/i })
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveAttribute("href", "/")
    })
  })

  describe("Validaciones del formulario", () => {
    it("debe mostrar error cuando los campos están vacíos", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Register))

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getAllByText("El nombre debe tener al menos 3 caracteres").length
        ).toBeGreaterThan(0)
        expect(screen.getAllByText("El email es obligatorio").length).toBeGreaterThan(0)
        expect(screen.getAllByText("La contraseña es requerida").length).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando las contraseñas no coinciden", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Register))

      await user.type(screen.getByPlaceholderText("Nombre completo"), VALID_NAME)
      await user.type(screen.getByPlaceholderText("Email"), VALID_EMAIL)
      await user.type(screen.getByPlaceholderText("Contraseña"), VALID_PASSWORD)
      await user.type(
        screen.getByPlaceholderText("Confirmar contraseña"),
        "WrongPassword"
      )

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument()
      })
    })

    it("debe aplicar estilos de error cuando hay errores de validación", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Register))

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("Nombre completo")
        expect(nameInput).toHaveClass("border-red-error")
      })
    })
  })

  describe("Funcionalidad mostrar contraseña", () => {
    it('debe cambiar el tipo de ambos inputs de contraseña al activar "Mostrar contraseña"', async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Register))

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const confirmPasswordInput = screen.getByPlaceholderText("Confirmar contraseña")
      const showPasswordCheckbox = screen.getByLabelText("Mostrar contraseña")

      expect(passwordInput).toHaveAttribute("type", "password")
      expect(confirmPasswordInput).toHaveAttribute("type", "password")

      await user.click(showPasswordCheckbox)

      expect(passwordInput).toHaveAttribute("type", "text")
      expect(confirmPasswordInput).toHaveAttribute("type", "text")

      await user.click(showPasswordCheckbox)

      expect(passwordInput).toHaveAttribute("type", "password")
      expect(confirmPasswordInput).toHaveAttribute("type", "password")
    })
  })

  describe("Proceso de registro", () => {
    it("debe llamar al servicio de registro con los datos correctos", async () => {
      const user = userEvent.setup()
      const mockUser = { id: 1, name: VALID_NAME, email: VALID_EMAIL }
      mockRegisterUser.mockResolvedValue(createMockResponse(mockUser))

      renderWithProviders(React.createElement(Register))

      await user.type(screen.getByPlaceholderText("Nombre completo"), VALID_NAME)
      await user.type(screen.getByPlaceholderText("Email"), VALID_EMAIL)
      await user.type(screen.getByPlaceholderText("Contraseña"), VALID_PASSWORD)
      await user.type(screen.getByPlaceholderText("Confirmar contraseña"),VALID_PASSWORD)

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalled()        
        const callArgs = mockRegisterUser.mock.calls[0][0]
  
        expect(callArgs).toEqual({
          name: VALID_NAME,
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        })
      })
    })

    it("debe mostrar estado de carga durante el registro", async () => {
      const user = userEvent.setup()
      let resolveRegister: any
      mockRegisterUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRegister = resolve
          })
      )

      renderWithProviders(React.createElement(Register))

      await user.type(screen.getByPlaceholderText("Nombre completo"), VALID_NAME)
      await user.type(screen.getByPlaceholderText("Email"), VALID_EMAIL)
      await user.type(screen.getByPlaceholderText("Contraseña"), VALID_PASSWORD)
      await user.type(screen.getByPlaceholderText("Confirmar contraseña"), VALID_PASSWORD)

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()

      resolveRegister(createMockResponse({ id: 1, name: VALID_NAME, email: VALID_EMAIL }))
    })

    it("debe mostrar alerta de bienvenida cuando el registro es exitoso", async () => {
      const user = userEvent.setup()
      const mockUser = { id: 1, name: VALID_NAME, email: VALID_EMAIL }
      mockRegisterUser.mockResolvedValue(createMockResponse(mockUser))

      const alertSpy = jest.spyOn(window, "alert")

      renderWithProviders(React.createElement(Register))

      await user.type(screen.getByPlaceholderText("Nombre completo"), VALID_NAME)
      await user.type(screen.getByPlaceholderText("Email"), VALID_EMAIL)
      await user.type(screen.getByPlaceholderText("Contraseña"), VALID_PASSWORD)
      await user.type(screen.getByPlaceholderText("Confirmar contraseña"), VALID_PASSWORD)

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(`¡Bienvenido ${VALID_NAME}!`)
      })
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup()
      mockRegisterUser.mockRejectedValue(new Error("Server error"))

      renderWithProviders(React.createElement(Register))

      await user.type(screen.getByPlaceholderText("Nombre completo"), VALID_NAME)
      await user.type(screen.getByPlaceholderText("Email"), VALID_EMAIL)
      await user.type(screen.getByPlaceholderText("Contraseña"), VALID_PASSWORD)
      await user.type(screen.getByPlaceholderText("Confirmar contraseña"), VALID_PASSWORD)

      const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Error en la autenticación")
        ).toBeInTheDocument()
      })
    })
  })
})
