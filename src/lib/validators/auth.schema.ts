import { z } from 'zod';

export const loginSchema = z.object({
  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .regex(/^\d+$/, 'La cédula debe ser numérica')
    .min(6, 'La cédula debe tener entre 6 y 10 dígitos')
    .max(10, 'La cédula debe tener entre 6 y 10 dígitos'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(1, 'La nueva contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/\d/, 'La contraseña debe contener al menos un número')
      .regex(/[@.$!%*?&]/, 'La contraseña debe contener al menos un caracter especial (@.$!%*?&)'),
    confirmarPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
