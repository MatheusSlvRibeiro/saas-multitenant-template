import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './Input.module.scss';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    onSuffixClick?: () => void;
    invalid?: boolean;
    inputClassName?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, id, prefix, suffix, onSuffixClick, invalid, inputClassName, error, ...rest },
        ref,
    ) => {
        return (
            <div className={styles.field}>
                {label && id && (
                    <label htmlFor={id} className={styles.field__label}>
                        {label}
                    </label>
                )}
                <div className={styles.field__wrapper}>
                    {prefix && <span className={styles.field__prefix}>{prefix}</span>}
                    <input
                        ref={ref}
                        id={id}
                        className={cn(
                            styles.field__input,
                            invalid && styles['field__input--invalid'],
                            prefix && styles['field__input--has-prefix'],
                            suffix && styles['field__input--has-suffix'],
                            inputClassName,
                        )}
                        {...rest}
                        aria-invalid={invalid || undefined}
                    />
                    {suffix && (
                        <button
                            type="button"
                            className={styles.field__suffix}
                            onClick={onSuffixClick}
                        >
                            {suffix}
                        </button>
                    )}
                </div>
                <span className={styles.field__error}>{error || ' '}</span>
            </div>
        );
    },
);

Input.displayName = 'Input';
