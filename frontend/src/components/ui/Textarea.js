import * as React from 'react';
import { cn } from '../../utils/cn';

const Textarea = React.forwardRef(({ className, invalid, success, ...props }, ref) => (
  <textarea
    className={cn(
      'input-field rounded-2xl min-h-[100px] resize-y',
      invalid && 'border-destructive focus-visible:ring-destructive',
      success && 'border-green-500 focus-visible:ring-green-500',
      className
    )}
    aria-invalid={invalid ? 'true' : 'false'}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export default Textarea;


