import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, PackageCheck, ShieldCheck, BookOpenCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuroraBackground } from '@/components/velora/aurora-background';
import { GridPattern } from '@/components/velora/grid-pattern';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import './style.css';

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
    } catch (err) {
      setError('Usuário ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="velora-theme min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--ledger-bg)] text-[var(--ledger-ink)]">
      {/* Left Column: Clean Editorial Login Form */}
      <section className="pt-safe-top lg:col-span-5 flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-14 bg-[var(--ledger-surface)] border-r border-[var(--ledger-border)]">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--ledger-sidebar-bg)] text-white shadow-sm">
            <PackageCheck className="size-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-[var(--ledger-ink)]">
              Estoque &amp; Caderneta
            </p>
            <p className="text-[0.72rem] font-medium uppercase tracking-widest text-[var(--ledger-ink-subtle)]">
              Sistema Operacional
            </p>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-[380px] py-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-muted)]">
              <Lock className="size-3 text-[var(--ledger-accent)]" />
              Acesso Restrito
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ledger-ink)]">
              Entrar no painel
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ledger-ink-muted)]">
              Informe suas credenciais para gerenciar inventário, movimentações e recebíveis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] px-3.5 py-3 text-sm text-[var(--ledger-danger)]"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-[var(--ledger-ink-muted)]"
              >
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="h-11 rounded-xl border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] px-3.5 text-base md:text-sm text-[var(--ledger-ink)] placeholder:text-[var(--ledger-ink-subtle)] focus-visible:border-[var(--ledger-accent)] focus-visible:bg-white focus-visible:ring-[var(--ledger-accent)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-[var(--ledger-ink-muted)]"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] pr-11 pl-3.5 text-base md:text-sm text-[var(--ledger-ink)] placeholder:text-[var(--ledger-ink-subtle)] focus-visible:border-[var(--ledger-accent)] focus-visible:bg-white focus-visible:ring-[var(--ledger-accent)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ledger-ink-subtle)] transition-colors hover:text-[var(--ledger-ink)]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="h-11 w-full rounded-xl bg-[var(--ledger-accent)] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--ledger-accent-hover)]"
            >
              {isLoading ? (
                'Entrando...'
              ) : (
                <>
                  <span>Acessar Sistema</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--ledger-border)] pt-4 text-xs text-[var(--ledger-ink-subtle)]">
          <span>Gestão Comercial &amp; Inventário</span>
          <span className="font-mono-tabular">v2.0</span>
        </div>
      </section>

      {/* Right Column: Editorial Industrial Showcase with Velora Aurora + GridPattern */}
      <section className="dark relative hidden lg:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-[#111917] p-12 text-stone-100">
        <AuroraBackground intensity="medium" className="opacity-35" />
        <GridPattern
          width={48}
          height={48}
          squares={[
            [2, 1],
            [5, 2],
            [8, 4],
            [4, 6],
            [10, 3],
          ]}
          className="fill-emerald-400/10 stroke-white/10"
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="font-mono-tabular rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wider text-emerald-300 backdrop-blur-sm">
            LEDGER // CONTROLE DE OPERAÇÃO
          </span>
        </div>

        <div className="relative z-10 max-w-xl space-y-6">
          <h2 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white">
            Precisão no estoque.{' '}
            <span className="text-emerald-400">Clareza na caderneta.</span>
          </h2>
          <p className="text-base leading-relaxed text-stone-300">
            Acompanhe níveis mínimos de mercadoria, ajuste quantidades com um clique, audite cada
            movimentação e mantenha o controle rigoroso dos pagamentos em aberto.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <PackageCheck className="size-5 text-emerald-400" />
              <p className="mt-3 text-sm font-semibold text-white">Inventário Vivo</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-400">
                Alertas automáticos de estoque baixo e ruptura.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <BookOpenCheck className="size-5 text-amber-400" />
              <p className="mt-3 text-sm font-semibold text-white">Caderneta Digital</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-400">
                Abatimentos parciais e quitação com rastreio.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <ShieldCheck className="size-5 text-emerald-300" />
              <p className="mt-3 text-sm font-semibold text-white">Auditoria Completa</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-400">
                Histórico cronológico de entradas e saídas.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 border-t border-white/10 pt-5 text-xs text-stone-400">
          <span>Operação multiusuário com controle por perfil</span>
          <span className="text-white/20">&bull;</span>
          <span className="font-mono-tabular">ADMIN / USER</span>
        </div>
      </section>
    </div>
  );
}

export default Login;
