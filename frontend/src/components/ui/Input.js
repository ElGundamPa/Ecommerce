import * as React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(
  (
    { className, type = 'text', invalid, success, iconLeft: IconLeft, iconRight: IconRight, ...props },
    ref
  ) => {
    return (
      <div className="relative">
        {IconLeft && (
          <IconLeft className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <input
          type={type}
          className={cn(
            'input-field rounded-2xl',
            IconLeft && 'pl-9',
            IconRight && 'pr-9',
            invalid && 'border-destructive focus-visible:ring-destructive',
            success && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          aria-invalid={invalid ? 'true' : 'false'}
          ref={ref}
          {...props}
        />
        {IconRight && (
          <IconRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;


