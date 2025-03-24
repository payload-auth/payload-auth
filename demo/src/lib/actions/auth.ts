"use server";

import getPayload from "../getPayload";

export async function signUp({
  email,
  password,
  role,
  name,
  image,
  //   callbackURL,
}: {
  email: string;
  password: string;
  role: string;
  name: string;
  image?: string;
  //   callbackURL: string;
}) {
  const payload = await getPayload();

  const resFoo = await payload.betterAuth.api.createUser({
    asResponse: true,
    body: {
      email,
      password,
      role: "admin",
      name,
    },
  });

  //   const res = await payload.betterAuth.api.signUpEmail({
  //     asResponse: true,
  //     body: {
  //       email,
  //       password,
  //       role: "admin",
  //       name,
  //       image,
  //     },
  //   });

  if (!resFoo.ok) {
    return new Response(resFoo.statusText, { status: resFoo.status });
  }

  //   if (callbackURL) {
  //     return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/admin`);
  //   }
  //   return new Response(resFoo.statusText, { status: 200 });
}

export async function addAdminRole(userId: string) {
  const payload = await getPayload();

  await payload.update({
    collection: "users",
    id: userId,
    data: {
      role: "admin",
    },
  });
}
