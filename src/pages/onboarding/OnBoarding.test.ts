/// <reference types="jest" />
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import Onboarding from "./Onbording"
import React from "react"

// Mock de react-router-dom para capturar navegación
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) =>
    React.createElement("a", { href: to, ...props }, children),
}))

// Mock de los componentes hijos
jest.mock("@/components/onboarding/OnBoardingStep", () => ({
  OnboardingStep: ({
    title,
    description,
    progress,
    onNext,
    onSkip,
    isLastStep,
    showIcons,
  }: any) =>
    React.createElement(
      "div",
      { "data-testid": "onboarding-step" },
      React.createElement("h2", null, title),
      React.createElement("p", null, description),
      React.createElement("span", null, `Progress: ${progress}%`),
      onNext &&
        React.createElement(
          "button",
          { onClick: onNext, "data-testid": "next-button" },
          "Siguiente"
        ),
      onSkip &&
        React.createElement(
          "button",
          { onClick: onSkip, "data-testid": "skip-button" },
          "Saltar"
        ),
      isLastStep &&
        React.createElement("span", { "data-testid": "last-step" }, "Last"),
      showIcons &&
        React.createElement("span", { "data-testid": "show-icons" }, "Icons")
    ),
}))

jest.mock("@/components/ui/CircularProgessButton", () => ({
  CircularProgressButton: ({ progress, onClick }: any) =>
    React.createElement(
      "button",
      { onClick, "data-testid": "circular-progress-button" },
      `Progress: ${progress}%`
    ),
}))

// Helper para renderizar con BrowserRouter
const renderWithRouter = (component: React.ReactElement) => {
  return render(React.createElement(BrowserRouter, null, component))
}

describe("Onboarding Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    jest.spyOn(console, "log").mockImplementation()
    jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("Renderizado inicial y estado de carga", () => {
    it("debe renderizar el paso 0 (bienvenida) cuando no hay onboarding completado", async () => {
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })
    })

    it("debe renderizar los elementos principales del paso de bienvenida", async () => {
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
        expect(screen.getByAltText("Logo")).toBeInTheDocument()
        expect(
          screen.getByText(/Unite para ayudar a reencontrar/)
        ).toBeInTheDocument()
        expect(
          screen.getByTestId("circular-progress-button")
        ).toBeInTheDocument()
        expect(screen.getByText("Ya tengo una cuenta")).toBeInTheDocument()
      })
    })

    it("debe saltar al paso 4 si el onboarding ya está completado", async () => {
      localStorage.setItem("onboarding_completed", "true")

      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument()
        expect(screen.getByText("Registrar")).toBeInTheDocument()
      })
    })
  })

  describe("Navegación entre pasos", () => {
    it("debe avanzar al paso 1 al hacer clic en el botón de progreso", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByText("Buscá o reportá")).toBeInTheDocument()
        expect(screen.getByText("Progress: 50%")).toBeInTheDocument()
      })
    })

    it("debe avanzar del paso 1 al paso 2", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      // Esperar a que cargue
      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Ir al paso 1
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByText("Buscá o reportá")).toBeInTheDocument()
      })

      // Ir al paso 2
      const nextButton = screen.getByTestId("next-button")
      await user.click(nextButton)

      await waitFor(() => {
        expect(
          screen.getByText(/Conectá con.*fundaciones y hogares.*temporales/)
        ).toBeInTheDocument()
        expect(screen.getByText("Progress: 75%")).toBeInTheDocument()
      })
    })

    it("debe avanzar del paso 2 al paso 3", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar hasta el paso 2
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("next-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(screen.getByTestId("next-button")).toBeInTheDocument()
      })

      // Ir al paso 3
      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(
          screen.getByText(/Tu próxima historia.*comienza con una.*huella/)
        ).toBeInTheDocument()
        expect(screen.getByText("Progress: 100%")).toBeInTheDocument()
      })
    })

    it("debe avanzar del paso 3 al paso 4 (login/register)", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar hasta el paso 3
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          expect(screen.getByTestId("next-button")).toBeInTheDocument()
        })
        await user.click(screen.getByTestId("next-button"))
      }

      await waitFor(() => {
        expect(screen.getByTestId("next-button")).toBeInTheDocument()
      })

      // Ir al paso 4
      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument()
        expect(screen.getByText("Registrar")).toBeInTheDocument()
      })
    })
  })

  describe("Funcionalidad de saltar pasos", () => {
    it("debe permitir saltar al paso 4 desde el paso 1", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Ir al paso 1
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      // Saltar
      await user.click(screen.getByTestId("skip-button"))

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument()
        expect(screen.getByText("Registrar")).toBeInTheDocument()
      })
    })

    it("debe permitir saltar al paso 4 desde el paso 2", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar al paso 2
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("next-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      // Saltar
      await user.click(screen.getByTestId("skip-button"))

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument()
      })
    })

    it("no debe mostrar botón de saltar en el paso 3 (último paso)", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar hasta el paso 3
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          expect(screen.getByTestId("next-button")).toBeInTheDocument()
        })
        await user.click(screen.getByTestId("next-button"))
      }

      await waitFor(() => {
        expect(screen.queryByTestId("skip-button")).not.toBeInTheDocument()
        expect(screen.getByTestId("last-step")).toBeInTheDocument()
      })
    })
  })

  describe("Persistencia del onboarding", () => {
    it("debe guardar en localStorage cuando se llega al paso 3", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar hasta el paso 3
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          expect(screen.getByTestId("next-button")).toBeInTheDocument()
        })
        await user.click(screen.getByTestId("next-button"))
      }

      await waitFor(() => {
        expect(
          screen.getByText(/Tu próxima historia.*comienza con una.*huella/)
        ).toBeInTheDocument()
      })

      // Verificar que se guardó en localStorage
      expect(localStorage.getItem("onboarding_completed")).toBe("true")
    })

    it("no debe guardar en localStorage si se salta directamente", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Ir al paso 1 y saltar
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("skip-button"))

      // No debe guardar el onboarding como completado
      expect(localStorage.getItem("onboarding_completed")).toBeNull()
    })
  })

  describe("Paso 4 - Login/Register", () => {
    it("debe mostrar los botones de Login y Registrar en el paso 4", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Navegar hasta el paso 4
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("skip-button"))

      await waitFor(() => {
        const loginButton = screen.getByText("Login")
        const registerButton = screen.getByText("Registrar")

        expect(loginButton).toBeInTheDocument()
        expect(registerButton).toBeInTheDocument()
        expect(loginButton.closest("a")).toHaveAttribute("href", "/login")
        expect(registerButton.closest("a")).toHaveAttribute(
          "href",
          "/register"
        )
      })
    })

    it("debe mostrar el logo en el paso 4", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("skip-button"))

      await waitFor(() => {
        expect(screen.getByAltText("Logo")).toBeInTheDocument()
      })
    })
  })

  describe("Características específicas de cada paso", () => {
    it("debe mostrar iconos en el paso 1", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("show-icons")).toBeInTheDocument()
      })
    })

    it("debe mostrar el progreso correcto en cada paso", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Paso 0 - 25%
      expect(screen.getByText("Progress: 25%")).toBeInTheDocument()

      // Paso 1 - 50%
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByText("Progress: 50%")).toBeInTheDocument()
      })

      // Paso 2 - 75%
      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(screen.getByText("Progress: 75%")).toBeInTheDocument()
      })

      // Paso 3 - 100%
      await user.click(screen.getByTestId("next-button"))

      await waitFor(() => {
        expect(screen.getByText("Progress: 100%")).toBeInTheDocument()
      })
    })
  })

  describe("Enlaces de navegación", () => {
    it("debe tener un enlace a login en el paso 0", async () => {
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        const loginLink = screen.getByText("Ya tengo una cuenta")
        expect(loginLink).toBeInTheDocument()
        expect(loginLink.closest("a")).toHaveAttribute("href", "/login")
      })
    })

    it("debe tener estilos correctos en los botones del paso 4", async () => {
      const user = userEvent.setup()
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        expect(screen.getByText("Bienvenido, somos")).toBeInTheDocument()
      })

      // Ir al paso 4
      const progressButton = screen.getByTestId("circular-progress-button")
      await user.click(progressButton)

      await waitFor(() => {
        expect(screen.getByTestId("skip-button")).toBeInTheDocument()
      })

      await user.click(screen.getByTestId("skip-button"))

      await waitFor(() => {
        const loginButton = screen.getByText("Login").closest("a")
        const registerButton = screen.getByText("Registrar").closest("a")

        expect(loginButton).toHaveClass("bg-violet-main")
        expect(registerButton).toHaveClass("border-4", "border-violet-main")
      })
    })
  })

  describe("Renderizado de imágenes", () => {
    it("debe renderizar las tres imágenes en el paso de bienvenida", async () => {
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        const images = screen.getAllByAltText("ilustration")
        expect(images).toHaveLength(3)
      })
    })

    it("debe renderizar el logo en el paso de bienvenida", async () => {
      renderWithRouter(React.createElement(Onboarding))

      await waitFor(() => {
        const logo = screen.getByAltText("Logo")
        expect(logo).toHaveAttribute("src", "/logo-name.svg")
      })
    })
  })
})