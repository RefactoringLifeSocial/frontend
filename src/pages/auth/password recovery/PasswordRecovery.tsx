import { Link } from "react-router-dom"
import { Icon } from "@iconify/react"
import { memo, useState } from "react"
import SendEmailForm from "@/components/password recovery/SendEmailForm"
const PasswordRecovery = () => {
  const [email, setEmail] = useState("")
  console.log(email)

  return (
    <div className="flex flex-col gap-8 min-h-screen md:min-h-0">
      <Link
        className="flex md:hidden items-center p-4 text-gray-600 hover:text-gray-900"
        to="/"
      >
        <Icon icon="mingcute:left-fill" className="size-7 font-bold" />
        <span className="sr-only">Volver</span>
      </Link>
      <SendEmailForm setEmail={setEmail} />
    </div>
  )
}

export default memo(PasswordRecovery)
