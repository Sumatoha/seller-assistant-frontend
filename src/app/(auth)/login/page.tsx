"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (mode === "register" && !firstName) {
      setError("Введите имя");
      return;
    }

    if (mode === "register" && password.length < 8) {
      setError("Пароль должен быть минимум 8 символов");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (mode === "login") {
        response = await api.login(email, password);
      } else {
        response = await api.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        });
      }
      setUser(response.user);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Пользователь с таким email уже существует");
      } else if (err.response?.status === 401) {
        setError("Неверный email или пароль");
      } else {
        setError("Ошибка. Попробуйте снова.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-xl font-bold text-primary">K</span>
          </div>
          <h1 className="text-xl font-semibold">Kaspi Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Войдите в аккаунт" : "Создайте аккаунт"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <Input
                label="Имя"
                type="text"
                placeholder="Иван"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Фамилия"
                type="text"
                placeholder="Иванов"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder={mode === "register" ? "Минимум 8 символов" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === "login" ? "Войти" : "Создать аккаунт"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button onClick={toggleMode} className="text-primary hover:underline">
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </div>
  );
}
