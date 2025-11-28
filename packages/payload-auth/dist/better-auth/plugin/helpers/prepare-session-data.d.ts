import type { Session, User } from 'better-auth';
import type { CollectionConfig } from 'payload';
export declare function prepareUser({ user, userCollection }: {
    user: User & Record<string, any>;
    userCollection: CollectionConfig;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
} & Record<string, any>>;
export declare function prepareSession({ session, sessionCollection }: {
    session: Session & Record<string, any>;
    sessionCollection: CollectionConfig;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
} & Record<string, any>>;
/**
 * Prepares session data for cookie cache by filtering user and session objects
 * based on the payload configuration's 'saveToJwt' property
 */
export declare function prepareSessionData({ sessionData, usersCollection, sessionsCollection }: {
    sessionData: {
        session: Session & Record<string, any>;
        user: User & Record<string, any>;
    };
    usersCollection: CollectionConfig;
    sessionsCollection: CollectionConfig;
}): Promise<{
    session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    } & Record<string, any>;
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    } & Record<string, any>;
} | null>;
//# sourceMappingURL=prepare-session-data.d.ts.map