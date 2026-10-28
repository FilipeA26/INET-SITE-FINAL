import { type ReactNode } from 'react';

export type HoverJitterProps = {
  children: ReactNode;
  className?: string;
  mediaClassName?: string;
  intensity?: 1 | 2 | 3;
  disabled?: boolean;
};

/** Compatibilidade com os usos existentes: zoom lento, sem tremida ou desfoque. */
export default function HoverJitter({ children, className = '', mediaClassName = '', disabled = false }: HoverJitterProps) {
  return <div data-hover-jitter data-zoom-disabled={disabled || undefined} className={`relative ${className}`}>
    <style>{`
      [data-hover-jitter-media]{transform:scale(1);transform-origin:center;transition:transform .8s cubic-bezier(.16,1,.3,1)}
      [data-hover-jitter]:not([data-zoom-disabled]):hover>[data-hover-jitter-media],
      a:focus-visible [data-hover-jitter]:not([data-zoom-disabled])>[data-hover-jitter-media],
      [tabindex]:focus-visible [data-hover-jitter]:not([data-zoom-disabled])>[data-hover-jitter-media],
      button:focus-visible [data-hover-jitter]:not([data-zoom-disabled])>[data-hover-jitter-media]{transform:scale(1.03)}
      @media(prefers-reduced-motion:reduce){[data-hover-jitter-media]{transform:none!important;transition:none!important}}
    `}</style>
    <div data-hover-jitter-media className={`h-full w-full ${mediaClassName}`}>{children}</div>
  </div>;
}
