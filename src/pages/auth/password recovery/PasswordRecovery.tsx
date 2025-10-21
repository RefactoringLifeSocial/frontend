import { Link } from "react-router-dom"
import { Icon } from "@iconify/react"
import { memo, useCallback, useState } from "react"
import SendEmailForm from "@/components/password recovery/SendEmailForm"
import CheckCodeForm from "@/components/password recovery/CheckCodeForm"
import PasswordForm from "@/components/password recovery/PasswordForm"
const PasswordRecovery = () => {
  const [step, setStep] = useState<"email" | "code" | "reset">("email")
  const [email, setEmail] = useState("")
  console.log(email)

  const handleEmailSent = useCallback((sentEmail: string) => {
    setEmail(sentEmail)
    setStep("code")
  }, [])

  const handleCodeVerified = useCallback(() => {
    setStep("reset")
  }, [])

  const handleBack = useCallback(() => {
    if (step === "reset") setStep("code")
    else if (step === "code") setStep("email")
  }, [step])

  return (
    <div className="flex flex-col gap-8 min-h-screen md:min-h-0">
      <Link
        className="flex md:hidden items-center p-4 text-gray-600 hover:text-gray-900"
        to="/login"
      >
        <Icon icon="mingcute:left-fill" className="size-7 font-bold" />
        <span className="sr-only">Volver</span>
      </Link>
      
      {step === "email" && <SendEmailForm onSuccess={handleEmailSent} />}

      {step === "code" && (
        <CheckCodeForm
          email={email}
          onSuccess={handleCodeVerified}
          onBack={handleBack}
        />
      )}

      {step === "reset" && <PasswordForm email={email} />}
    </div>
  )
}

export default memo(PasswordRecovery)
