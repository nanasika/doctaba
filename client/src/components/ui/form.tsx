import React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form";

const Form = ({ children, ...props }: any) => {
  // Filter out react-hook-form specific props before passing to DOM
  const { 
    handleSubmit, 
    control, 
    formState, 
    register, 
    unregister, 
    watch, 
    reset, 
    trigger, 
    subscribe,
    getFieldState,
    formControl,
    ...domProps 
  } = props;
  
  return <form {...domProps}>{children}</form>;
};

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={`space-y-2 ${className || ''}`} {...props} />
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { error?: any }
>(({ className, children, error, ...props }, ref) => {
  const message = children || error?.message;
  
  if (!message) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={`text-sm font-medium text-red-500 ${className || ''}`}
      {...props}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
};