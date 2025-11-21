/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import Login from "./Login"
import axiosInstance from "@/services/axiosInstance"
import React from "react"
import type { AxiosResponse } from "axios"
import Cookies from "js-cookie"

// Mock de axiosInstance en lugar del servicio
jest.mock("@/services/axiosInstance", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))
const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>

// Mock de Cookies
jest.mock("js-cookie")
const mockCookies = Cookies as jest.Mocked<typeof Cookies>

// Mock de react-router-dom para capturar navegación
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}))

// Mock del store de autenticación
const mockSetAuthUser = jest.fn()
jest.mock("@/stores/AuthStore", () => ({
  useAuthStore: () => ({
    setAuthUser: mockSetAuthUser,
  }),
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

// Helper para crear respuestas mock de Axios con la nueva estructura
const createMockLoginResponse = (
  token: string
): AxiosResponse<{ access_token: string }> => ({
  data: {
    access_token: token,
  },
  status: 200,
  statusText: "OK",
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
  config: {
    headers: {} as any,
  } as any,
})

// Token de ejemplo válido
const MOCK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiJkNTY0MDAzNy0xYmQwLTQ0ZDgtYjAxMi0wYjY0ZDU3MDhjZTMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzQwMzgyM30.acibHBt5Cd0azXpc_MPor5F95Igafon0VewqDGltCv4"

// Contraseña válida que cumple con el schema
const VALID_PASSWORD = "Password123"

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "log").mockImplementation()
    jest.spyOn(console, "error").mockImplementation()
    jest.spyOn(window, "alert").mockImplementation()

    // Mock de Cookies.set para que no falle
    mockCookies.set.mockImplementation(() => undefined as any)

    // Resetear el mock de axios
    mockAxiosInstance.post.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("Renderizado inicial", () => {
    it("debe renderizar todos los elementos del formulario", () => {
      renderWithProviders(React.createElement(Login))

      // Buscar por el logo (aunque dice "Iniciar sesión" en el test, el componente no tiene ese texto)
      expect(screen.getByAltText("Logo")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
      expect(screen.getByLabelText("Mostrar contraseña")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument()
      expect(screen.getByText("¿Olvidaste la contraseña?")).toBeInTheDocument()
    })

    it("debe mostrar el botón de Google", () => {
      renderWithProviders(React.createElement(Login))

      const googleButton = screen.getByRole("button", {
        name: /Continuar con Google/i,
      })
      expect(googleButton).toBeInTheDocument()
    })
  })

  describe("Validaciones del formulario", () => {
    it("debe mostrar error cuando el email está vacío", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /Login/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getAllByText("El email es obligatorio").length
        ).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando el email es inválido", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@test")
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getAllByText("El email no es valido").length
        ).toBeGreaterThan(0)
      })
    })

    it("debe mostrar error cuando la contraseña está vacía", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      await user.type(emailInput, "test@example.com")

      const submitButton = screen.getByRole("button", { name: /Login/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getAllByText("La contraseña es requerida").length
        ).toBeGreaterThan(0)
      })
    })

    it("debe aplicar estilos de error cuando hay errores de validación", async () => {
      const user = userEvent.setup()
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /Login/i })
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
      mockAxiosInstance.post.mockResolvedValue(
        createMockLoginResponse(MOCK_TOKEN)
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith("auth/login", {
          email: "test@example.com",
          password: VALID_PASSWORD,
        })
      })
    })

    it("debe guardar el token en cookies tras login exitoso", async () => {
      const user = userEvent.setup()
      mockAxiosInstance.post.mockResolvedValue(
        createMockLoginResponse(MOCK_TOKEN)
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCookies.set).toHaveBeenCalledWith(
          "token",
          MOCK_TOKEN,
          expect.objectContaining({
            expires: expect.any(Date),
          })
        )
      })
    })

    it("debe actualizar el store de autenticación tras login exitoso", async () => {
      const user = userEvent.setup()
      mockAxiosInstance.post.mockResolvedValue(
        createMockLoginResponse(MOCK_TOKEN)
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSetAuthUser).toHaveBeenCalledWith(
          expect.objectContaining({
            token: MOCK_TOKEN,
            user: expect.any(Object),
          })
        )
      })
    })

    it("debe mostrar estado de carga durante la autenticación", async () => {
      const user = userEvent.setup()
      let resolveLogin: any
      mockAxiosInstance.post.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve
          })
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      // Verificar que muestra el estado de carga
      await waitFor(() => {
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()

      // Resolver la promesa
      resolveLogin(createMockLoginResponse(MOCK_TOKEN))
    })

    it("debe mostrar error cuando las credenciales son incorrectas (401)", async () => {
      const user = userEvent.setup()
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      })

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos.")
        ).toBeInTheDocument()
      })
    })

    it("debe mostrar error cuando falla la petición al servidor", async () => {
      const user = userEvent.setup()
      mockAxiosInstance.post.mockRejectedValue(new Error("Network error"))

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Error en la autenticación.")
        ).toBeInTheDocument()
      })
    })

    it("debe limpiar el error al volver a intentar el login", async () => {
      const user = userEvent.setup()

      // Primer intento fallido
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      })

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      // Primer intento - error
      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos.")
        ).toBeInTheDocument()
      })

      // Limpiar inputs
      await user.clear(emailInput)
      await user.clear(passwordInput)

      // Segundo intento - exitoso
      mockAxiosInstance.post.mockResolvedValueOnce(
        createMockLoginResponse(MOCK_TOKEN)
      )

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2)
      })

      // El error debería limpiarse
      await waitFor(() => {
        expect(
          screen.queryByText("Email o contraseña incorrectos.")
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("Accesibilidad", () => {
    it("debe tener un submit button con texto apropiado", () => {
      renderWithProviders(React.createElement(Login))

      const submitButton = screen.getByRole("button", { name: /Login/i })
      expect(submitButton).toHaveAttribute("type", "submit")
    })

    it("debe permitir enviar el formulario con Enter", async () => {
      const user = userEvent.setup()
      mockAxiosInstance.post.mockResolvedValue(
        createMockLoginResponse(MOCK_TOKEN)
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, `${VALID_PASSWORD}{Enter}`)

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalled()
      })
    })

    it("debe deshabilitar los inputs durante el loading", async () => {
      const user = userEvent.setup()
      let resolveLogin: any
      mockAxiosInstance.post.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve
          })
      )

      renderWithProviders(React.createElement(Login))

      const emailInput = screen.getByPlaceholderText("Email")
      const passwordInput = screen.getByPlaceholderText("Contraseña")
      const submitButton = screen.getByRole("button", { name: /Login/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, VALID_PASSWORD)
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
      })

      // Resolver la promesa para limpiar
      resolveLogin(createMockLoginResponse(MOCK_TOKEN))
    })
  })
})
