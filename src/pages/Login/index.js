import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, PackageCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard/stock');
    } catch (_err) {
      setError('Usuário ou senha inválidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <main className="min-h-screen w-full bg-[var(--ledger-bg)] text-[var(--ledger-ink)] flex flex-col justify-center px-4 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-6">
      <div className="mx-auto w-full max-w-[400px]">
        {/* Brand Header */}
        <header className="mb-6 flex items-center justify-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ledger-sidebar-bg)] text-emerald-400 shadow-xs">
            <PackageCheck className="size-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[var(--ledger-ink)]">
            Estoque &amp; Caderneta
          </span>
        </header>

        {/* Precision Ledger Card */}
        <section
          aria-labelledby="login-heading"
          className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-6 sm:p-8 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-8px_rgba(24,24,27,0.06)]"
        >
          <div className="mb-6">
            <h1
              id="login-heading"
              className="text-[1.375rem] font-bold leading-tight tracking-tight text-[var(--ledger-ink)]"
            >
              Entrar no painel
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ledger-ink-muted)]">
              Informe seu usuário e senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] px-3.5 py-2.5 text-[0.8125rem] leading-snug text-[var(--ledger-danger)]"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-[0.8125rem] font-medium text-[var(--ledger-ink-muted)]"
              >
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Seu usuário"
                value={username}
                onChange={handleUsernameChange}
                required
                autoFocus
                className="h-11 rounded-xl border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-3.5 text-base md:text-sm text-[var(--ledger-ink)] shadow-[inset_0_1px_2px_rgba(24,24,27,0.04)] placeholder:text-[var(--ledger-ink-subtle)] focus:border-[var(--ledger-accent)] focus:ring-3 focus:ring-[var(--ledger-accent)]/15 focus-visible:border-[var(--ledger-accent)] focus-visible:bg-[var(--ledger-surface)] focus-visible:ring-3 focus-visible:ring-[var(--ledger-accent)]/15"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[0.8125rem] font-medium text-[var(--ledger-ink-muted)]"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="h-11 rounded-xl border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] pr-11 pl-3.5 text-base md:text-sm text-[var(--ledger-ink)] shadow-[inset_0_1px_2px_rgba(24,24,27,0.04)] placeholder:text-[var(--ledger-ink-subtle)] focus:border-[var(--ledger-accent)] focus:ring-3 focus:ring-[var(--ledger-accent)]/15 focus-visible:border-[var(--ledger-accent)] focus-visible:bg-[var(--ledger-surface)] focus-visible:ring-3 focus-visible:ring-[var(--ledger-accent)]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[var(--ledger-ink-subtle)] transition-colors hover:text-[var(--ledger-ink)]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="h-11 w-full rounded-xl bg-[var(--ledger-accent)] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,110,86,0.25)] transition-all hover:bg-[var(--ledger-accent-hover)]"
              >
                {isLoading ? (
                  'Entrando...'
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Quiet Footer */}
        <footer className="mt-6 text-center text-[0.8125rem] text-[var(--ledger-ink-subtle)]">
          Controle de Estoque &amp; Caderneta <span aria-hidden="true">&middot;</span>{' '}
          <span className="font-mono-tabular">v2.0</span>
        </footer>
      </div>
    </main>
  );
}

export default Login;
