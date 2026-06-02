import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/quests";

  const supabase = await createClient();

  // PKCE flow — code exchange (used by @supabase/ssr default)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // OTP / token_hash flow (older Supabase email format)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "email" | "magiclink" | "recovery" | "invite" });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Both failed — send back to login with visible error
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
