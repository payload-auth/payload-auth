import { Main } from "@/components/main";
import { AuthCard } from "@daveyplate/better-auth-ui";

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-0 h-full self-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
          Choose how you'd like to continue
        </p>
      </div>
        <AuthCard view="signIn" />
      </div>
    </Main>
  );
}
