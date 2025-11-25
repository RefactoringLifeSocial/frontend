import { Icon } from "@iconify/react"

export const CircularProgressButton = ({
  progress,
  onClick,
}: {
  progress: number
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="relative size-[74px] rounded-full bg-white flex items-center justify-center -rotate-90"
    style={{
      background: `conic-gradient(#31c4e8 ${progress}%, #d1d5db 0%)`,
      transition: "background 0.4s ease",
    }}
  >
    <div className="size-16 rounded-full bg-white flex items-center justify-center">
      <span className="text-5xl text-sky-main rotate-180">
        <Icon icon="line-md:arrow-up" className="inline-block" />
      </span>
    </div>
  </button>
)
