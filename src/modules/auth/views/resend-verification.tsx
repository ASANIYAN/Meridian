import { EmailRequestView } from '../components/email-request-view'

export function ResendVerificationView() {
  return (
    <EmailRequestView
      title="Resend link"
      lede={<>Confirm, then <em className="italic text-brass-soft">converge</em>.</>}
      submitLabel="Resend verification"
      description="Enter your email and we'll send a fresh verification link. If an account needs verifying, it's on its way."
    />
  )
}
