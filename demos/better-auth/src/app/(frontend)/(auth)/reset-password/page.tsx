import { Main } from "@/components/main";
import { AuthCard } from "@daveyplate/better-auth-ui";

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-0 h-full self-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>
        <AuthCard view="resetPassword" redirectTo="/sign-in" />
      </div>
    </Main>
  );
}
