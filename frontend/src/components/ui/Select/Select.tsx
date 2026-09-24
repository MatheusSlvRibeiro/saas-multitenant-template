import type { ChangeEvent } from 'react';
import { cn } from '@/lib/cn';
import styles from './Select.module.scss';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    id?: string;
    name?: string;
    className?: string;
}

export function Select({
    label,
    value,
    onChange,
    onBlur,
    options,
    placeholder,
    required,
    disabled,
    error,
    id,
    name,
    className,
}: SelectProps) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className={cn(styles['select-field'], className)}>
            {label && id && (
                <label htmlFor={id} className={styles['select-field__label']}>
                    {label}
                    {required && <span className={styles['select-field__label-required']}>*</span>}
                </label>
            )}
            <div
                className={cn(
                    styles['select-field__wrapper'],
                    error && styles['select-field__wrapper--invalid'],
                    disabled && styles['select-field__wrapper--disabled'],
                )}
            >
                <select
                    id={id}
                    name={name}
                    value={value}
                    disabled={disabled}
                    onChange={handleChange}
                    onBlur={onBlur}
                    className={styles['select-field__select']}
                    aria-invalid={Boolean(error) || undefined}
                >
                    {options.length === 0 && (
                        <option value="" disabled>
                            {placeholder || 'Nenhuma opção'}
                        </option>
                    )}
                    {options.length > 0 && value === '' && (
                        <option value="">{placeholder || 'Selecione'}</option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <svg
                    className={styles['select-field__chevron']}
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <span className={styles['select-field__error']}>{error || ' '}</span>
        </div>
    );
}
