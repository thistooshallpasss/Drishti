/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://javerefwezfbroyfajuu.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdmVyZWZ3ZXpmYnJveWZhanV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM3MTcsImV4cCI6MjEwMjAzOTcxN30.r43m-BHX6DX2o4KS16nOWZW0qAkwO3Ds8-DkIWxSMeM',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
