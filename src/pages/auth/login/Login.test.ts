/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import Login from "./Login"
import login from "@/services/AuthServices"
import React from "react"
import type { AxiosResponse } from "axios"

// Mock del servicio de autenticación
jest.mock("@/services/AuthServices")
const mockLogin = login as jest.MockedFunction<typeof login>

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
  status: 200,
  statusText: "OK",
  headers: {},
  config: {
    headers: {} as any,
  } as any,
})

// Contraseña válida que cumple con el schema
const VALID_PASSWORD = "Password123"

describe("Login Component", () => {
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
      renderWithProviders(React.createElement(Login))

      expect(screen.getByText("Iniciar sesión")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
      expect(screen.getByLabelText("Mostrar contraseña")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument()
      expect(screen.getByText("¿Olvidaste la contraseña?")).toBeInTheDocument()
    })

    it("debe mostrar el enlace de registro", () => {
      renderWithProviders(React.createElement(Login))

      const registerLink = screen.getByRole("link", {
        name: /regístrate aquí/i,
      })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute("href", "/register")
    })

    it("debe mostrar el botón de volver en mobile", () => {
      renderWithProviders(React.createElement(Login))

      const backButton = screen.getByRole("link", { name: /volver/i })
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveAttribute("href", "/")
    })
  })

  describe("Validaciones del formulario", () => {
    it("debe mostrar error cuando el email está vacío", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getAllByText("El email es obligatorio").length).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando el email es inválido", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /entrar/i })
      
      // Usar un email con formato válido de HTML5 pero que Zod rechazará
      await user.type(emailInput, "test@test")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getAllByText("El email no es valido").length).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando la contraseña está vacía", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      await user.type(emailInput, "test@example.com")

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getAllByText("La contraseña es requerida").length).toBeGreaterThan(0)
      })
    })

    it("debe aplicar estilos de error cuando hay errores de validación", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText("Email")
        expect(emailInput).toHaveClass("border-red-error")
      })
    })
  })

  describe("Funcionalidad mostrar contraseña", () => {
    it('debe cambiar el tipo de input al activar "Mostrar contraseña"', async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const showPasswordCheckbox = screen.getByLabelText("Mostrar contraseña")

      expect(passwordInput).toHaveAttribute("type", "password")

      await user.click(showPasswordCheckbox)

      expect(passwordInput).toHaveAttribute("type", "text")
    })

    it("debe volver a ocultar la contraseña al desactivar el checkbox", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const showPasswordCheckbox = screen.getByLabelText("Mostrar contraseña")

      await user.click(showPasswordCheckbox)
      expect(passwordInput).toHaveAttribute("type", "text")

      await user.click(showPasswordCheckbox)
      expect(passwordInput).toHaveAttribute("type", "password")
    })
  })

  describe("Proceso de autenticación", () => {
    it("debe llamar al servicio de login con los datos correctos", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(
        createMockResponse([
          { id: 1, name: "Test User", email: "test@example.com" },
        ])
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        // Verificar que se llamó al menos una vez
        expect(mockLogin).toHaveBeenCalled()
        // Verificar que el primer argumento es el objeto con email y password
        const firstCallArgs = mockLogin.mock.calls[0][0]
        expect(firstCallArgs).toEqual({
          email: "test@example.com",
          password: VALID_PASSWORD,
        })
      })
    })

    it("debe mostrar estado de carga durante la autenticación", async () => {
      const user = userEvent.setup()
      let resolveLogin: any
      mockLogin.mockImplementation(
        () => new Promise((resolve) => {
          resolveLogin = resolve
        })
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      // Verificar que muestra el estado de carga
      await waitFor(() => {
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()

      // Resolver la promesa
      resolveLogin(createMockResponse([{ id: 1, name: "Test", email: "test@example.com" }]))
    })

    it("debe mostrar alerta de bienvenida cuando el login es exitoso", async () => {
      const user = userEvent.setup()
      const mockUser = { id: 1, name: "Juan Pérez", email: "juan@example.com" }
      mockLogin.mockResolvedValue(createMockResponse([mockUser]))

      const alertSpy = jest.spyOn(window, "alert")

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "juan@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("¡Bienvenido Juan Pérez!")
      })
    })

    it("debe mostrar error cuando las credenciales son incorrectas", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(createMockResponse([]))

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error("Network error"))

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Error en la autenticación")
        ).toBeInTheDocument()
      })
    })

    it("debe limpiar el error al volver a intentar el login", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce(createMockResponse([]))

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /entrar/i })

      // Primer intento - error
      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos")
        ).toBeInTheDocument()
      })

      // Limpiar el error antes del segundo intento
      // Necesitamos esperar y limpiar los inputs
      await user.clear(emailInput)
      await user.clear(passwordInput)

      // Segundo intento - exitoso
      mockLogin.mockResolvedValueOnce(
        createMockResponse([{ id: 1, name: "Test", email: "test@example.com" }])
      )

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      
      // El error debería limpiarse cuando hacemos click nuevamente
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(2)
      })

      // Después del segundo envío exitoso, el error no debería estar
      await waitFor(() => {
        expect(
          screen.queryByText("Email o contraseña incorrectos")
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("Accesibilidad", () => {
    it("debe tener inputs accesibles con placeholders apropiados", () => {
      renderWithProviders(React.createElement(Login))

      expect(screen.getByPlaceholderText("Email")).toHaveAttribute(
        "type",
        "email"
      )
      expect(screen.getByPlaceholderText("Contraseña")).toHaveAttribute(
        "type",
        "password"
      )
    })

    it("debe tener un submit button con texto apropiado", () => {
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /entrar/i })
      expect(submitButton).toHaveAttribute("type", "submit")
    })

    it("debe permitir enviar el formulario con Enter", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(
        createMockResponse([{ id: 1, name: "Test", email: "test@example.com" }])
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, `${VALID_PASSWORD}{Enter}`)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })
  })
})