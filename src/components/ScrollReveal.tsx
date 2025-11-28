import { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

export const ScrollReveal = ({ children, className = '' }: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
