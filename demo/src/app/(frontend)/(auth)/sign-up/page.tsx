import { Main } from "@/components/main";
import { AuthCard } from "@daveyplate/better-auth-ui";

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-0 h-full self-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Create an account to get started
          </p>
      </div>
        <AuthCard view="signUp" />
      </div>
    </Main>
  );
}
