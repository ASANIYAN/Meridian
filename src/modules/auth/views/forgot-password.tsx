import { EmailRequestView } from '../components/email-request-view'

export function ForgotPasswordView() {
  return (
    <EmailRequestView
      title="Reset password"
      lede={<>Find your way <em className="italic text-brass-soft">back</em>.</>}
      submitLabel="Send reset link"
      description="Enter your email and we'll send a link to set a new password. If an account exists, it's on its way."
    />
  )
}
