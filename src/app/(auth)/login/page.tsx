"use client";

import { useState, useTransition } from "react";
import { loginWithCredentialsAction } from "./actions";
import { Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginWithCredentialsAction(email, password);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div >
      <div >
        <div >
          <div >
            <Sparkles size={20} fill="currentColor" />
          </div>
          <p >
            My<span >Hub</span>
          </p>
        </div>

        <div >
          <h2 >Вхід</h2>
          <p >Доступ до вашого особистого хабу</p>

          <form onSubmit={handleSubmit} >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required

            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required

            />
            {error && <p >{error}</p>}
            <button
              type="submit"
              disabled={isPending}

            >
              {isPending && <Loader2 size={16} />}
              Увійти
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
