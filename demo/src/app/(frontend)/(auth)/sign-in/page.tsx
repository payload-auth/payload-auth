import { Main } from '@/components/main'
import { AuthCard } from '@daveyplate/better-auth-ui'

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="mx-auto h-full w-full max-w-md self-center px-4 sm:px-0">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Choose how you'd like to continue</p>
        </div>
        <AuthCard view="signIn" />
      </div>
    </Main>
  )
}
