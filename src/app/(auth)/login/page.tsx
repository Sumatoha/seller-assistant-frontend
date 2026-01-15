"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [telegramId, setTelegramId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!telegramId || !username) {
      setError("Please fill in all fields");
      return;
    }

    const telegramIdNum = parseInt(telegramId);
    if (isNaN(telegramIdNum)) {
      setError("Telegram ID must be a number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(telegramIdNum, username);
      setUser(response.user);
      router.push("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary font-bold">
              K
            </div>
            <span className="text-xl font-semibold text-white">Kaspi Assistant</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white">
            Manage your Kaspi store smarter
          </h1>
          <p className="mt-4 text-lg text-white/80">
            AI-powered review responses, automatic price dumping, inventory tracking - all in one place.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-medium text-primary"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/80">
            Trusted by 1000+ Kaspi sellers
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold">
              K
            </div>
            <span className="text-xl font-semibold">Kaspi Assistant</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in with your Telegram credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Telegram ID"
              type="text"
              placeholder="123456789"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
            />

            <Input
              label="Username"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              Sign in with Telegram
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span className="font-medium text-primary">
              Start by messaging our Telegram bot
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
