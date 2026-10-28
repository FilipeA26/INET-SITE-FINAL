import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { SPRING } from '../../motion';

export type ScrollSpinProps = {
  children: ReactNode;
  variant?: 'phone' | 'box';
  label?: string;
  className?: string;
  mediaClassName?: string;
};

/** Produto integrado ao hero; a rolagem preserva a lateral do aparelho. */
export default function ScrollSpin({ children, variant = 'phone', label = 'Apresentação do produto', className = '', mediaClassName = '' }: ScrollSpinProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const p = useSpring(scrollYProgress, SPRING);
  const rotateY = useTransform(p, [0, 1], [-32, 22]);
  const rotateX = useTransform(p, [0, 1], [8, -6]);
  const rotateZ = useTransform(p, [0, 1], [-5, 4]);
  return <div ref={ref} role="img" aria-label={label} data-scroll-spin={variant} className={`relative flex items-center justify-center py-8 ${className}`} style={{ perspective: 1200 }}>
    <style>{`@media(prefers-reduced-motion:reduce){[data-scroll-spin]>div{transform:rotateY(-20deg)!important}}`}</style>
    <motion.div className={`relative ${variant === 'phone' ? 'w-[min(60vw,255px)]' : 'w-[min(80vw,680px)]'} ${mediaClassName}`} style={{ transformStyle: 'preserve-3d', ...(reduced ? { rotateY: -20 } : { rotateY, rotateX, rotateZ }) }}>
      {children}
    </motion.div>
  </div>;
}
