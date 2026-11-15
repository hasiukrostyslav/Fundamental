import { clearFieldError, clearFormMessage, isValidEmail, showFieldError, showFormMessage } from './validation.js';

type Field = HTMLInputElement | HTMLTextAreaElement;

const contactForm = document.querySelector<HTMLFormElement>('.feedback__form');

function validateField(field: Field): boolean {
  const value = field.value.trim();

  if (!value) {
    showFieldError(field, 'This field is required');
    return false;
  }

  if (field.type === 'email' && !isValidEmail(value)) {
    showFieldError(field, 'Enter a valid email, for example name@example.com');
    return false;
  }

  clearFieldError(field);
  return true;
}

if (contactForm) {
  contactForm.noValidate = true;
  const fields = contactForm.querySelectorAll<Field>('input, textarea');

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      clearFormMessage(contactForm);
      if (field.type === 'email' || field.classList.contains('form-control--error')) {
        validateField(field);
      }
    });

    field.addEventListener('blur', () => validateField(field));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      showFormMessage(contactForm, 'Please fix the errors above and try again.', 'error');
      return;
    }

    contactForm.reset();
    showFormMessage(contactForm, 'Thank you! Your message has been sent.', 'success');
  });
}
