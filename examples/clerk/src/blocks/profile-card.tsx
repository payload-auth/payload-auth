import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@clerk/nextjs/server"

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.imageUrl} alt={user.firstName || "User"} />
          <AvatarFallback>{user.firstName?.[0] || user.emailAddresses[0].emailAddress?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>
            {user.firstName} {user.lastName}
          </CardTitle>
          <CardDescription>{user.emailAddresses[0].emailAddress}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Email Addresses</h3>
            <ul className="mt-2 text-sm text-muted-foreground">
              {user.emailAddresses.map((email) => (
                <li key={email.id} className="flex items-center">
                  {email.emailAddress}
                  {email.id === user.primaryEmailAddressId && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {user.phoneNumbers && user.phoneNumbers.length > 0 && (
            <div>
              <h3 className="font-medium">Phone Numbers</h3>
              <ul className="mt-2 text-sm text-muted-foreground">
                {user.phoneNumbers.map((phone) => (
                  <li key={phone.id}>{phone.phoneNumber}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

