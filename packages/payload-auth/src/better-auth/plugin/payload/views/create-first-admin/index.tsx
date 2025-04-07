import React from "react";
import type { AdminViewServerProps, ServerProps } from "payload";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { redirect } from "next/navigation";
import { Gutter, PayloadIcon } from "@payloadcms/ui";
import { PayloadLogo } from "@payloadcms/ui/graphics/Logo";
import SignUp from "../../components/sign-up";

type CreateFirstAdminProps = AdminViewServerProps & {
  defaultAdminRole: string;
};

const CreateFirstAdmin: React.FC<CreateFirstAdminProps> = async ({
  initPageResult,
  params,
  searchParams,
  defaultAdminRole,
}: CreateFirstAdminProps) => {
  const { locale, permissions, req } = initPageResult;
  const {
    i18n,
    payload: { config },
    payload,
    user,
  } = req;

  const {
    admin: {
      components: { afterLogin, beforeLogin, graphics } = {},
      user: userSlug,
    },
    routes: { admin, api },
  } = config;

  const adminCount = await req.payload.count({
    collection: userSlug,
    where: {
      role: {
        equals: defaultAdminRole ?? "admin",
      },
    },
  });

  if (adminCount.totalDocs > 0) {
    redirect(admin);
  }

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  const filteredAfterLogin =
    Array.isArray(afterLogin) && afterLogin.length > 1
      ? afterLogin.slice(1)
      : undefined;

  return (
    <Gutter className="mt-40">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginBottom: "1.5rem",
          }}
        >
          {RenderServerComponent({
            Component: graphics?.Logo,
            Fallback: () => <PayloadLogo />,
            importMap: payload.importMap,
            serverProps: {
              i18n,
              locale,
              params,
              payload,
              permissions,
              searchParams,
              user: user ?? undefined,
            } satisfies ServerProps,
          })}
        </div>
        {RenderServerComponent({
          Component: beforeLogin,
          importMap: payload.importMap,
          serverProps: {
            i18n,
            locale,
            params,
            payload,
            permissions,
            searchParams,
            user: user ?? undefined,
          } satisfies ServerProps,
        })}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SignUp
            admin={true}
            apiRoute={api}
            userSlug={userSlug}
            defaultAdminRole={defaultAdminRole}
          />
        </div>
        {RenderServerComponent({
          Component: filteredAfterLogin,
          importMap: payload.importMap,
          serverProps: {
            i18n,
            locale,
            params,
            payload,
            permissions,
            searchParams,
            user: user ?? undefined,
          } satisfies ServerProps,
        })}
      </div>
    </Gutter>
  );
};

export default CreateFirstAdmin;
