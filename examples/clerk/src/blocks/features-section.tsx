import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Users } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Discover what makes Clerk the best authentication solution for your Next.js application.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <Shield className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Enterprise-grade security with multi-factor authentication and fraud protection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Protect your users with the latest security standards and best practices.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <Zap className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Fast Integration</CardTitle>
              <CardDescription>Get up and running in minutes with pre-built components and hooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save development time with our easy-to-use SDK and comprehensive documentation.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>Complete user management with profiles, roles, and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your users with ease using our intuitive dashboard and API.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

