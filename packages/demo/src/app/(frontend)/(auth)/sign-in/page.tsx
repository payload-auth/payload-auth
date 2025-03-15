"use client";

import SignIn from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  // useEffect(() => {
  //   authClient.oneTap({
  //     clientId:
  //       "147172375749-bm67o0u8bv3bagq76qghb2qj9io1i73m.apps.googleusercontent.com",
  //   });
  // }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to continue
        </p>
      </div>
      <Tabs defaultValue="sign-in" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in" className="w-full">
          <SignIn />
        </TabsContent>
        <TabsContent value="sign-up" className="w-full">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  );
}
