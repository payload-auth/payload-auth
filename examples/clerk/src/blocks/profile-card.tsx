import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@clerk/nextjs/server'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.imageUrl} alt={user.firstName || 'User'} />
          <AvatarFallback>{user.firstName?.[0] || user.emailAddresses[0].emailAddress?.[0] || 'U'}</AvatarFallback>
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
            <ul className="text-muted-foreground mt-2 text-sm">
              {user.emailAddresses.map((email) => (
                <li key={email.id} className="flex items-center">
                  {email.emailAddress}
                  {email.id === user.primaryEmailAddressId && (
                    <span className="bg-primary/10 text-primary ml-2 rounded px-2 py-0.5 text-xs">Primary</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {user.phoneNumbers && user.phoneNumbers.length > 0 && (
            <div>
              <h3 className="font-medium">Phone Numbers</h3>
              <ul className="text-muted-foreground mt-2 text-sm">
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
