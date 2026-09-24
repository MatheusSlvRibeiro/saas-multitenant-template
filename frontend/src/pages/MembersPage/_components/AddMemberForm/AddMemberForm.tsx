import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { useApiFormError } from '@/lib/forms/useApiFormError';
import { addMemberSchema, type AddMemberData } from './AddMemberForm.schema';
import styles from './AddMemberForm.module.scss';

const roleOptions = [
    { value: 'member', label: 'Membro' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
];

interface AddMemberFormProps {
    onSubmit: (data: AddMemberData) => Promise<void>;
    onCancel: () => void;
}

export function AddMemberForm({ onSubmit, onCancel }: AddMemberFormProps) {
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<AddMemberData>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: { role: 'member' },
    });
    const { wrapSubmit } = useApiFormError<AddMemberData>(setError);

    const submit = wrapSubmit(onSubmit);

    return (
        <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
            <Input
                id="userId"
                label="ID do usuário"
                placeholder="00000000-0000-0000-0000-000000000000"
                invalid={Boolean(errors.userId)}
                error={errors.userId?.message}
                {...register('userId')}
            />

            <Controller
                control={control}
                name="role"
                render={({ field }) => (
                    <Select
                        id="add-member-role"
                        label="Papel"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={roleOptions}
                        error={errors.role?.message}
                    />
                )}
            />

            {errors.root && (
                <span className={styles.form__error} role="alert">
                    {errors.root.message}
                </span>
            )}

            <div className={styles.form__actions}>
                <button type="button" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}>
                    Adicionar
                </button>
            </div>
        </form>
    );
}
