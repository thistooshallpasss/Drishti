import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.trim() !== '' &&
      supabaseAnonKey.trim() !== '' &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      !supabaseUrl.includes('placeholder')
  );
};

export const getSupabaseConfigStatus = () => {
  return {
    hasUrl: Boolean(supabaseUrl && supabaseUrl.trim() !== ''),
    urlDisplay: supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : 'NOT_SET',
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.trim() !== ''),
    anonKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    isConfigured: isSupabaseConfigured(),
  };
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
