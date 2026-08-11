import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://javerefwezfbroyfajuu.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdmVyZWZ3ZXpmYnJveWZhanV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM3MTcsImV4cCI6MjEwMjAzOTcxN30.r43m-BHX6DX2o4KS16nOWZW0qAkwO3Ds8-DkIWxSMeM';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.trim() !== '' &&
      supabaseAnonKey.trim() !== '' &&
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
