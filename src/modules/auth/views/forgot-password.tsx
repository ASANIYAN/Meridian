import { EmailRequestView } from '../components/email-request-view'
import { useForgotPassword } from '../hooks/use-email-request'

export function ForgotPasswordView() {
  const hook = useForgotPassword()
  return (
    <EmailRequestView
      hook={hook}
      title="Reset password"
      lede={
        <>
          Find your way <em className="italic text-brass-soft">back</em>.
        </>
      }
      submitLabel="Send reset link"
      description="Enter your email and we'll send a link to set a new password."
      sent={{
        heading: 'Check your email',
        description: 'If an account exists for that email, a reset link is on its way.',
      }}
    />
  )
}
