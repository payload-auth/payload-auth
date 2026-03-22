import { describe, expect, it } from "vitest";
import { baModelKey } from "../../plugin/constants";
import { configureOrganizationPlugin } from "../../plugin/lib/sanitize-better-auth-options/organizations-plugin";
import { BetterAuthSchemas } from "../../plugin/types";

// Helper to create a minimal resolved schemas object
function createMockResolvedSchemas(
  overrides: Partial<
    Record<
      string,
      { modelName: string; fields: Record<string, any>; order: number }
    >
  > = {}
): BetterAuthSchemas {
  const defaultSchemas: Record<string, any> = {
    [baModelKey.organization]: {
      modelName: "organizations",
      fields: { name: { fieldName: "name" } },
      order: 0
    },
    [baModelKey.member]: {
      modelName: "members",
      fields: {
        organizationId: { fieldName: "organization" },
        userId: { fieldName: "user" },
        role: { fieldName: "role" }
      },
      order: 1
    },
    [baModelKey.invitation]: {
      modelName: "invitations",
      fields: {
        organizationId: { fieldName: "organization" },
        inviterId: { fieldName: "inviter" },
        teamId: { fieldName: "team" }
      },
      order: 2
    },
    [baModelKey.team]: {
      modelName: "teams",
      fields: { organizationId: { fieldName: "organization" } },
      order: 3
    },
    [baModelKey.teamMember]: {
      modelName: "team-members",
      fields: {
        teamId: { fieldName: "team" },
        userId: { fieldName: "user" }
      },
      order: 4
    },
    [baModelKey.session]: {
      modelName: "sessions",
      fields: {
        activeOrganizationId: { fieldName: "activeOrganization" },
        activeTeamId: { fieldName: "activeTeam" }
      },
      order: 5
    },
    [baModelKey.user]: {
      modelName: "users",
      fields: {},
      order: 6
    },
    [baModelKey.organizationRole]: {
      modelName: "organization-roles",
      fields: {},
      order: 7
    }
  };

  return { ...defaultSchemas, ...overrides } as unknown as BetterAuthSchemas;
}

// Helper to get nested property using lodash-style dot notation
function get(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

describe("configureOrganizationPlugin", () => {
  // P0-2 REGRESSION TEST: team.organizationId must reference organization, NOT user
  it("sets team.organizationId.references.model to organization collection, NOT user", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const teamOrgRef = get(
      plugin,
      `schema.${baModelKey.team}.fields.organizationId.references.model`
    );
    expect(teamOrgRef).toBe("organizations");
    expect(teamOrgRef).not.toBe("users");
  });

  it("sets member.organizationId.references.model to organization collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const memberOrgRef = get(
      plugin,
      `schema.${baModelKey.member}.fields.organizationId.references.model`
    );
    expect(memberOrgRef).toBe("organizations");
  });

  it("sets member.userId.references.model to user collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const memberUserRef = get(
      plugin,
      `schema.${baModelKey.member}.fields.userId.references.model`
    );
    expect(memberUserRef).toBe("users");
  });

  it("sets invitation.organizationId.references.model to organization collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const invOrgRef = get(
      plugin,
      `schema.${baModelKey.invitation}.fields.organizationId.references.model`
    );
    expect(invOrgRef).toBe("organizations");
  });

  it("sets invitation.inviterId.references.model to user collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const invInviterRef = get(
      plugin,
      `schema.${baModelKey.invitation}.fields.inviterId.references.model`
    );
    expect(invInviterRef).toBe("users");
  });

  it("sets invitation.teamId.references.model to team collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const invTeamRef = get(
      plugin,
      `schema.${baModelKey.invitation}.fields.teamId.references.model`
    );
    expect(invTeamRef).toBe("teams");
  });

  it("sets teamMember.teamId.references.model to team collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const tmTeamRef = get(
      plugin,
      `schema.${baModelKey.teamMember}.fields.teamId.references.model`
    );
    expect(tmTeamRef).toBe("teams");
  });

  it("sets teamMember.userId.references.model to user collection", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    const tmUserRef = get(
      plugin,
      `schema.${baModelKey.teamMember}.fields.userId.references.model`
    );
    expect(tmUserRef).toBe("users");
  });

  it("sets all model names correctly", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas();

    configureOrganizationPlugin(plugin, schemas);

    expect(get(plugin, `schema.${baModelKey.organization}.modelName`)).toBe(
      "organizations"
    );
    expect(get(plugin, `schema.${baModelKey.member}.modelName`)).toBe(
      "members"
    );
    expect(get(plugin, `schema.${baModelKey.invitation}.modelName`)).toBe(
      "invitations"
    );
    expect(get(plugin, `schema.${baModelKey.team}.modelName`)).toBe("teams");
    expect(get(plugin, `schema.${baModelKey.session}.modelName`)).toBe(
      "sessions"
    );
    expect(get(plugin, `schema.${baModelKey.teamMember}.modelName`)).toBe(
      "team-members"
    );
    expect(get(plugin, `schema.${baModelKey.organizationRole}.modelName`)).toBe(
      "organization-roles"
    );
  });

  it("uses custom collection slugs when configured", () => {
    const plugin: any = {};
    const schemas = createMockResolvedSchemas({
      [baModelKey.organization]: {
        modelName: "my-orgs",
        fields: { name: { fieldName: "name" } },
        order: 0
      },
      [baModelKey.team]: {
        modelName: "my-teams",
        fields: { organizationId: { fieldName: "org" } },
        order: 3
      }
    });

    configureOrganizationPlugin(plugin, schemas);

    expect(get(plugin, `schema.${baModelKey.organization}.modelName`)).toBe(
      "my-orgs"
    );
    // P0-2: team.organizationId should reference the organization collection, not users
    const teamOrgRef = get(
      plugin,
      `schema.${baModelKey.team}.fields.organizationId.references.model`
    );
    expect(teamOrgRef).toBe("my-orgs");
  });
});
