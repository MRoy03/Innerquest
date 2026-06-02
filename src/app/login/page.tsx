"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <h2 className="text-xl font-display font-bold text-text">Check your email</h2>
              <p className="text-text-muted text-sm">
                We sent a magic link to <strong className="text-text">{email}</strong>. Click it to sign in.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-xl font-display font-bold text-text">Sign in to InnerQuest</h1>
                <p className="text-text-muted text-sm mt-1">We'll send you a magic link — no password needed.</p>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
                />
              </div>
              {error && (
                <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Send Magic Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
