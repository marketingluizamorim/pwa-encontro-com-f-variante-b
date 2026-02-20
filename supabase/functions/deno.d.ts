// Deno global type shims for VS Code / local TypeScript server.
// These types allow the TS server to understand Deno-specific APIs
// without requiring the Deno VS Code extension.
// Runtime: Supabase Edge Functions (Deno Deploy).

declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        has(key: string): boolean;
        toObject(): Record<string, string>;
    }

    export const env: Env;

    export function serve(
        handler: (request: Request) => Response | Promise<Response>,
        options?: {
            port?: number;
            hostname?: string;
            signal?: AbortSignal;
            onListen?: (addr: { hostname: string; port: number }) => void;
        },
    ): Promise<void>;

    /** Process exit */
    export function exit(code?: number): never;

    /** Read a file as bytes */
    export function readFile(path: string): Promise<Uint8Array>;

    /** Read a file as text */
    export function readTextFile(path: string): Promise<string>;
}

// Allow URL-based ESM imports (https://esm.sh/...) without TS errors
declare module "https://esm.sh/@supabase/supabase-js@2.49.4" {
    export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.39.7" {
    export * from "@supabase/supabase-js";
}
