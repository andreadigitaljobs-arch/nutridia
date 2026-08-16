export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: 'El email es obligatorio' };
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(trimmed)) return { valid: false, error: 'Formato de email inválido' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'La contraseña es obligatoria' };
  if (password.length < 6) return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  return { valid: true };
}

export function validateWeight(weight: number): { valid: boolean; error?: string } {
  if (weight <= 0) return { valid: false, error: 'El peso debe ser mayor a 0' };
  if (weight < 20) return { valid: false, error: 'El peso parece demasiado bajo' };
  if (weight > 400) return { valid: false, error: 'El peso parece demasiado alto' };
  return { valid: true };
}

export function validateHeight(height: number): { valid: boolean; error?: string } {
  if (height <= 0) return { valid: false, error: 'La estatura debe ser mayor a 0' };
  if (height < 50) return { valid: false, error: 'La estatura parece demasiado baja' };
  if (height > 280) return { valid: false, error: 'La estatura parece demasiado alta' };
  return { valid: true };
}
