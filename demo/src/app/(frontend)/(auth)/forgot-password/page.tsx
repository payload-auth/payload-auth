import { Main } from "@/components/main";
import { AuthCard } from "@daveyplate/better-auth-ui";

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-0 h-full self-center">
        <AuthCard view="forgotPassword" />
      </div>
    </Main>
  );
}
