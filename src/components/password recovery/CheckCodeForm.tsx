import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { sendPasswordResetEmail, verifyCode } from "@/services/AuthServices"
import { Icon } from "@iconify/react"

interface CheckCodeFormProps {
  onSuccess: (code: string) => void
  onBack: () => void
  email: string
}

const CheckCodeForm = ({ onSuccess, onBack, email }: CheckCodeFormProps) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Mutation para reenviar código
  const resendMutation = useMutation({
    mutationFn: () => sendPasswordResetEmail({ email }),
    onSuccess: () => {
      console.log("Código reenviado exitosamente")
      setTimer(60)
      setCanResend(false)
      setError("")
    },
    onError: (error: any) => {
      setError("Error al reenviar el código. Intenta de nuevo.")
      console.error("Error al reenviar:", error)
    },
  })

  // Mutation para verificar código
  const verifyMutation = useMutation({
    mutationFn: (codeToVerify: string) =>
      verifyCode({ email, code: codeToVerify }),
    onSuccess: (response) => {
      if (response.data.length > 0) {
        onSuccess(code.join(""))
      } else {
        setError("Código incorrecto. Intenta de nuevo.")
        setCode(Array(6).fill(""))
        inputRefs.current[0]?.focus()
      }
    },
    onError: (error: any) => {
      setError("Error al verificar el código. Intenta de nuevo.")
      console.error("Error al verificar:", error)
    },
  })

  // Contador de 60 segundos
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return // solo números

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verificar cuando se completa el código
    if (newCode.every((digit) => digit !== "")) {
      const fullCode = newCode.join("")
      verifyMutation.mutate(fullCode)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    if (!/^\d{6}$/.test(pastedData)) {
      setError("Por favor, pega un código válido de 6 dígitos")
      return
    }
    const newCode = pastedData.split("")
    setCode(newCode)
    setError("")

    inputRefs.current[5]?.focus()

    verifyMutation.mutate(pastedData)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const newCode = [...code]
        newCode[index] = ""
        setCode(newCode)
        setError("")
      }
    }
  }

  const handleResend = () => {
    if (!canResend || resendMutation.isPending) return
    resendMutation.mutate()
  }

  const formatTime = (seconds: number) => {
    return seconds < 10 ? `0${seconds}` : seconds
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <button
        onClick={onBack}
        className="self-start text-gray-600 text-sm flex items-center gap-1 cursor-pointer hover:text-violet-main"
      >
        <Icon icon="mingcute:left-fill" className="font-bold" /> Volver
      </button>

      <h2 className="text-2xl font-semibold">¡Gracias!</h2>
      <p className="text-gray-600 text-center">
        Te enviamos un código de verificación a<br />
        <span className="font-medium">{email}</span>
      </p>

      {/* Inputs del código */}
      <div className="flex gap-2 mt-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e)}
            disabled={verifyMutation.isPending}
            className="w-12 h-12 text-center text-xl border-b-2 border-gray-400 focus:border-purple-600 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Loading state */}
      {verifyMutation.isPending && (
        <p className="text-purple-600 text-sm">Verificando código...</p>
      )}

      <button
        className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        onClick={handleResend}
        disabled={!canResend || resendMutation.isPending}
      >
        {resendMutation.isPending
          ? "Enviando..."
          : canResend
          ? "Reenviar código"
          : `00:${formatTime(timer)}`}
      </button>

      <hr className="text-gray-200 w-full" />

      <a
        href={`mailto:${email}`}
        className="text-purple-600 text-sm mt-2 hover:text-purple-700 underline"
      >
        Ir al Email
      </a>
    </div>
  )
}

export default CheckCodeForm
