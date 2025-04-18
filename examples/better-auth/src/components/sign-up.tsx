'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { DiscordLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { authClient, signUp } from '@/lib/auth/client'
import Image from 'next/image'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addAdminRole } from '@/lib/auth/actions'

export function SignUp({ admin = false }: { admin?: boolean }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  const [loading, setLoading] = useState(false)

  // const handleSignUp = async ({
  //   email,
  //   password,
  //   role,
  //   name,
  //   image,
  //   callbackURL,
  // }: {
  //   email: string;
  //   password: string;
  //   role: string;
  //   name: string;
  //   image?: File | null;
  //   callbackURL?: string;
  // }) => {
  //   setLoading(true);

  //   await signUp({
  //     email,
  //     password,
  //     role: admin ? "admin" : "user",
  //     name: `${firstName} ${lastName}`,
  //     // image: image ? await convertImageToBase64(image) : "",
  //     // callbackURL: ""
  //   });
  // };

  return (
    <Card className="z-50 w-full max-w-md rounded-md rounded-t-none shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold md:text-2xl">Sign Up</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-sm font-medium">
                First name
              </Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                onChange={(e) => {
                  setFirstName(e.target.value)
                }}
                value={firstName}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-sm font-medium">
                Last name
              </Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                required
                onChange={(e) => {
                  setLastName(e.target.value)
                }}
                value={lastName}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              value={email}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Password"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-sm font-medium">
              Confirm Password
            </Label>
            <PasswordInput
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e: any) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm Password"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Profile Image (optional)
            </Label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <Image src={imagePreview} alt="Profile preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-1 items-center gap-2">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                {imagePreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              if (password !== passwordConfirmation) {
                toast.error('Please ensure your password and confirm password match.')
                return
              }
              const user = await authClient.signUp.email({
                email,
                password,
                role: admin ? 'admin' : 'user',
                name: `${firstName} ${lastName}`,
                callbackURL: admin ? '/admin' : '/dashboard',
                fetchOptions: {
                  onResponse: () => {
                    setLoading(false)
                  },
                  onRequest: () => {
                    setLoading(true)
                  },
                  onError: (ctx) => {
                    toast.error(ctx.error.message)
                  },
                  onSuccess: async () => {
                    router.push(admin ? '/admin' : '/dashboard')
                  }
                }
              })

              const userId = user.data?.user.id

              if (userId && admin) {
                await addAdminRole(userId)
              }

              // await handleSignUp({
              //   email,
              //   password,
              //   role: admin ? "admin" : "user",
              //   name: `${firstName} ${lastName}`,
              //   // image: image ? await convertImageToBase64(image) : "",

              // });
            }}
          >
            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            {loading ? 'Creating account...' : 'Create an account'}
          </Button>

          {!admin && (
            <div>
              <div className="relative my-4">
                <div className="border-muted relative flex justify-center border-b pb-4 text-xs uppercase">
                  <span className="bg-card text-muted-foreground px-2">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'github',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="GitHub"
                >
                  <GitHubLogoIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'discord',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Discord"
                >
                  <DiscordLogoIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'google',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Google"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 262">
                    <path
                      fill="#4285F4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                      fill="#34A853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                      fill="#FBBC05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                      fill="#EB4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    const { data } = await authClient.signIn.social({
                      provider: 'microsoft',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Microsoft"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'twitch',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Twitch"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"
                    ></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'facebook',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
                    ></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: 'twitter',
                      callbackURL: '/dashboard'
                    })
                  }}
                  title="Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14">
                    <g fill="none">
                      <g clipPath="url(#primeTwitter0)">
                        <path
                          fill="currentColor"
                          d="M11.025.656h2.147L8.482 6.03L14 13.344H9.68L6.294 8.909l-3.87 4.435H.275l5.016-5.75L0 .657h4.43L7.486 4.71zm-.755 11.4h1.19L3.78 1.877H2.504z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="primeTwitter0">
                          <path fill="#fff" d="M0 0h14v14H0z"></path>
                        </clipPath>
                      </defs>
                    </g>
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="w-full border-t pt-4">
          <p className="text-muted-foreground text-center text-xs">
            Secured by{' '}
            <Link className="font-medium text-orange-500" href="https://github.com/forrestdevs/payload-better-auth">
              payload-better-auth
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
