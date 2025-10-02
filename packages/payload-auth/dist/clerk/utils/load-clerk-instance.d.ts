import type { Clerk } from '@clerk/clerk-js';
declare global {
    interface Window {
        clerkInstance?: Clerk;
    }
}
export declare function loadClerkInstance(): Promise<Clerk | undefined>;
//# sourceMappingURL=load-clerk-instance.d.ts.map