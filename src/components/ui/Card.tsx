import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-700', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={clsx('px-6 py-4 bg-gray-900 border-t border-gray-700', className)}>
      {children}
    </div>
  );
}

