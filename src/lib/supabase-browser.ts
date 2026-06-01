import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let clientSingleton: SupabaseClient | null = null;

/**
 * Creates a browser-side Supabase client with cookie-based session management.
 * This replaces the old localStorage-based client for admin auth flows.
 * Use inside Client Components for auth operations and Realtime subscriptions.
 */
export function createSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  if (!clientSingleton) {
    clientSingleton = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return clientSingleton;
}
