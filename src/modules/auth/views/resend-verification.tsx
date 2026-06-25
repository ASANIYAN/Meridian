import { EmailRequestView } from '../components/email-request-view'
import { useResendVerification } from '../hooks/use-email-request'

export function ResendVerificationView() {
  const hook = useResendVerification()
  return (
    <EmailRequestView
      hook={hook}
      title="Resend link"
      lede={<>Confirm, then <em className="italic text-brass-soft">converge</em>.</>}
      submitLabel="Resend verification"
      description="Enter your email and we'll send a fresh verification link."
      sent={{
        heading: 'Check your email',
        description: 'If an account needs verifying, a new link is on its way.',
      }}
    />
  )
}
