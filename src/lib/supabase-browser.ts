import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a browser-side Supabase client with cookie-based session management.
 * This replaces the old localStorage-based client for admin auth flows.
 * Use inside Client Components for auth operations and Realtime subscriptions.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
