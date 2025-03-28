"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth/client";
import { useBetterAuth } from "@/lib/auth/context";
import { ChevronDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function AccountSwitcher() {
  const { currentUserPromise, deviceSessionsPromise } = useBetterAuth();
  const currentUser = use(currentUserPromise);
  const deviceSessions = use(deviceSessionsPromise);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a user"
          className="w-[250px] justify-between"
        >
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage
              src={currentUser?.image || ""}
              alt={currentUser?.name ?? ""}
            />
            <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{currentUser?.name}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-background border border-border shadow-md">
        <Command>
          <CommandList>
            <CommandGroup heading="Current Account">
              <CommandItem
                onSelect={() => {}}
                className="text-sm w-full justify-between hover:bg-accent/50"
                key={`current-account-${currentUser?.id}`}
              >
                <div className="flex items-center">
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={currentUser?.image || ""}
                      alt={currentUser?.name ?? ""}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{currentUser?.name}</span>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Switch Account">
              {deviceSessions && deviceSessions
                .filter((session) => session.user.id !== currentUser?.id)
                .map((userSession, index) => (
                  <CommandItem
                    key={index}
                    onSelect={async () => {
                      await authClient.multiSession.setActive({
                        sessionToken: userSession.session.token,
                      });
                      setOpen(false);
                    }}
                    className="text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage src={userSession.user.image || ""} alt={userSession.user.name} />
                      <AvatarFallback className="bg-secondary/20 text-secondary">
                        {userSession.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{userSession.user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {userSession.user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.push("/sign-in");
                  setOpen(false);
                }}
                className="cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-200 group"
              >
                <PlusCircle className="mr-2 h-5 w-5 text-primary group-hover:text-primary/80 transition-colors duration-200" />
                <span className="font-medium">Add Account</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
