import React, { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check, X } from 'lucide-react';

const MAX_VISIBLE_TOASTS = 2;
const DEFAULT_SUCCESS_DURATION = 2000;
const DEFAULT_ERROR_DURATION = 3800;

let nextId = 1;
let toastsState = [];
const listeners = new Set();
const timers = new Map();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function clearToastTimer(id) {
  const entry = timers.get(id);
  if (entry?.timeoutId) {
    clearTimeout(entry.timeoutId);
  }
  timers.delete(id);
}

function scheduleDismiss(id, duration) {
  clearToastTimer(id);
  if (!duration || duration <= 0) return;

  const startedAt = Date.now();
  const timeoutId = setTimeout(() => {
    timers.delete(id);
    dismissToast(id);
  }, duration);

  timers.set(id, { timeoutId, remaining: duration, startedAt, paused: false });
}

function pauseToastTimer(id) {
  const entry = timers.get(id);
  if (!entry || entry.paused) return;
  clearTimeout(entry.timeoutId);
  const elapsed = Date.now() - entry.startedAt;
  const remaining = Math.max(600, entry.remaining - elapsed);
  timers.set(id, { timeoutId: null, remaining, startedAt: 0, paused: true });
}

function resumeToastTimer(id) {
  const entry = timers.get(id);
  if (!entry || !entry.paused) return;
  scheduleDismiss(id, entry.remaining);
}

function dismissToast(id) {
  clearToastTimer(id);
  const next = toastsState.filter((item) => item.id !== id);
  if (next.length !== toastsState.length) {
    toastsState = next;
    emitChange();
  }
}

function pushToast(variant, message, options = {}) {
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  if (!cleanMessage) return null;

  const duration =
    options.duration ??
    (variant === 'error' ? DEFAULT_ERROR_DURATION : DEFAULT_SUCCESS_DURATION);

  const duplicate = toastsState.find(
    (item) => item.variant === variant && item.message === cleanMessage
  );
  if (duplicate) {
    scheduleDismiss(duplicate.id, duration);
    return duplicate.id;
  }

  const id = nextId++;
  const nextItem = { id, variant, message: cleanMessage };

  let baseList = toastsState;
  if (baseList.length >= MAX_VISIBLE_TOASTS) {
    const evicted = baseList.slice(0, baseList.length - MAX_VISIBLE_TOASTS + 1);
    evicted.forEach((old) => clearToastTimer(old.id));
    baseList = baseList.slice(baseList.length - MAX_VISIBLE_TOASTS + 1);
  }

  toastsState = [...baseList, nextItem];
  scheduleDismiss(id, duration);
  emitChange();
  return id;
}

export const ledgerToast = {
  success: (message, options) => pushToast('success', message, options),
  error: (message, options) => pushToast('error', message, options),
  dismiss: dismissToast,
};

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toastsState;
}

export function LedgerToastViewport() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[80] flex flex-col items-center gap-2 lg:inset-x-auto lg:top-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((item) => {
          const isError = item.variant === 'error';

          return (
            <motion.div
              key={item.id}
              layout="position"
              role={isError ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
              onMouseEnter={() => pauseToastTimer(item.id)}
              onMouseLeave={() => resumeToastTimer(item.id)}
              onClick={() => dismissToast(item.id)}
              className={`group pointer-events-auto flex w-auto max-w-[min(92vw,360px)] cursor-pointer items-center gap-2.5 rounded-xl bg-[var(--ledger-sidebar-bg)]/95 px-3 py-2.5 text-left text-[0.8125rem] font-medium leading-snug text-stone-100 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.42)] backdrop-blur-md ${
                isError
                  ? 'border border-red-400/30 ring-1 ring-red-500/15'
                  : 'border border-white/12 ring-1 ring-emerald-400/15'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${
                  isError
                    ? 'bg-red-500/15 text-red-400 ring-1 ring-red-400/25'
                    : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25'
                }`}
              >
                {isError ? (
                  <AlertCircle className="size-3.5 stroke-[2.25]" />
                ) : (
                  <Check className="size-3.5 stroke-[2.5]" />
                )}
              </span>

              <span className="min-w-0 flex-1 break-words pr-0.5 text-stone-100">
                {item.message}
              </span>

              <button
                type="button"
                aria-label="Fechar aviso"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(item.id);
                }}
                className="flex size-5 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-100"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
