export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = HTMLInputElement | HTMLTextAreaElement;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function showFieldError(field: Field, message: string): void {
  field.classList.add('form-control--error');

  let error = field.nextElementSibling;
  if (!error?.classList.contains('form-error')) {
    error = document.createElement('p');
    error.className = 'form-error';
    field.after(error);
  }
  error.textContent = message;
}

export function clearFieldError(field: Field): void {
  field.classList.remove('form-control--error');

  const error = field.nextElementSibling;
  if (error?.classList.contains('form-error')) error.remove();
}

export function showFormMessage(form: HTMLFormElement, text: string, type: 'success' | 'error'): void {
  let message = form.querySelector('.form-message');
  if (!message) {
    message = document.createElement('p');
    form.append(message);
  }

  message.className = `form-message form-message--${type}`;
  message.textContent = text;
}

export function clearFormMessage(form: HTMLFormElement): void {
  form.querySelector('.form-message')?.remove();
}
