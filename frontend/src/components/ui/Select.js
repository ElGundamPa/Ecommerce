import * as React from 'react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(({ className, invalid, success, children, ...props }, ref) => (
  <select
    className={cn(
      'input-field rounded-2xl appearance-none',
      invalid && 'border-destructive focus-visible:ring-destructive',
      success && 'border-green-500 focus-visible:ring-green-500',
      className
    )}
    aria-invalid={invalid ? 'true' : 'false'}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export default Select;


