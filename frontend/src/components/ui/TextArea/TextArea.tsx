import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './TextArea.module.scss';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix'> {
    label?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    onSuffixClick?: () => void;
    invalid?: boolean;
    textAreaClassName?: string;
    error?: string;
    /** Some visível "usados/limite" quando maxLength está definido. Default: true. */
    showCharCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            id,
            prefix,
            suffix,
            onSuffixClick,
            invalid,
            textAreaClassName,
            error,
            rows = 4,
            maxLength,
            showCharCount = true,
            onChange,
            defaultValue,
            value,
            ...rest
        },
        ref,
    ) => {
        // Sem `value` controlado (ex.: campo registrado via RHF, que é uncontrolled),
        // a contagem só reflete a digitação a partir daqui — não o valor inicial.
        const [charCount, setCharCount] = useState(
            () => String(value ?? defaultValue ?? '').length,
        );

        const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(event.target.value.length);
            onChange?.(event);
        };

        return (
            <div className={styles.field}>
                {label && id && (
                    <label htmlFor={id} className={styles.field__label}>
                        {label}
                    </label>
                )}
                <div className={styles.field__wrapper}>
                    {prefix && (
                        <span
                            className={cn(styles.field__prefix, styles['field__prefix--textarea'])}
                        >
                            {prefix}
                        </span>
                    )}
                    <textarea
                        ref={ref}
                        id={id}
                        rows={rows}
                        maxLength={maxLength}
                        value={value}
                        defaultValue={value === undefined ? defaultValue : undefined}
                        onChange={handleChange}
                        className={cn(
                            styles.field__input,
                            styles.field__textarea,
                            invalid && styles['field__input--invalid'],
                            prefix && styles['field__input--has-prefix'],
                            suffix && styles['field__input--has-suffix'],
                            textAreaClassName,
                        )}
                        {...rest}
                        aria-invalid={invalid || undefined}
                    />
                    {suffix && (
                        <button
                            type="button"
                            className={cn(styles.field__suffix, styles['field__suffix--textarea'])}
                            onClick={onSuffixClick}
                        >
                            {suffix}
                        </button>
                    )}
                </div>
                <div className={styles.field__footer}>
                    <span className={styles.field__error}>{error || ' '}</span>
                    {maxLength !== undefined && showCharCount && (
                        <span
                            className={cn(
                                styles.field__counter,
                                charCount >= maxLength && styles['field__counter--limit'],
                            )}
                        >
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    },
);

TextArea.displayName = 'TextArea';
