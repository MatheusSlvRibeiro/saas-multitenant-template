import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Select } from '@/components/ui/Select/Select';
import { useApiFormError } from '@/lib/forms/useApiFormError';
import type {
    Membership,
    MembershipRole,
} from '@/lib/services/MembershipService/MembershipService';
import { editRoleSchema, type EditRoleData } from './EditRoleForm.schema';
import styles from './EditRoleForm.module.scss';

const roleOptions = [
    { value: 'member', label: 'Membro' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
];

interface EditRoleFormProps {
    membership: Membership;
    onSubmit: (data: EditRoleData) => Promise<void>;
    onCancel: () => void;
}

export function EditRoleForm({ membership, onSubmit, onCancel }: EditRoleFormProps) {
    const {
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<EditRoleData>({
        resolver: zodResolver(editRoleSchema),
        defaultValues: { role: (membership.role ?? 'member') as MembershipRole },
    });
    const { wrapSubmit } = useApiFormError<EditRoleData>(setError);

    const submit = wrapSubmit(onSubmit);

    return (
        <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
            <p className={styles.form__subject}>{membership.user.username}</p>

            <Controller
                control={control}
                name="role"
                render={({ field }) => (
                    <Select
                        id="edit-role"
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
                    Salvar
                </button>
            </div>
        </form>
    );
}
