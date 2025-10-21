interface CheckCodeFormProps {
  onSuccess: (code: string) => void
  onBack: () => void
  email: string
}
const CheckCodeForm = ({ onSuccess, onBack, email }: CheckCodeFormProps) => {
  return <div>CheckCodeForm</div>
}
export default CheckCodeForm
