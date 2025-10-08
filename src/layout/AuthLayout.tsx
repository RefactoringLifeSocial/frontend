import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-8">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md bg-white md:rounded-2xl md:shadow-xl">
        <Outlet />
      </div>
    </div>
  )
}
