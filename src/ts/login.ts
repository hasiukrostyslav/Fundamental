const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showError(input: HTMLInputElement, message: string): void {
  const field = input.closest('.login__field');
  if (!field) return;

  let error = field.querySelector('.login__error');
  if (!error) {
    error = document.createElement('p');
    error.className = 'login__error';
    field.append(error);
  }

  error.textContent = message;
  input.classList.add('form-control--error');
}

function clearError(input: HTMLInputElement): void {
  const error = input.closest('.login__field')?.querySelector('.login__error');
  if (error) error.remove();
  input.classList.remove('form-control--error');
}

function setPasswordVisible(input: HTMLInputElement, toggle: HTMLButtonElement, visible: boolean): void {
  input.type = visible ? 'text' : 'password';
  toggle.classList.toggle('login__toggle--active', visible);

  const icon = toggle.querySelector('img');
  if (icon) icon.alt = visible ? 'Hide password' : 'Show password';
}

export function initLogin(): void {
  const accountButton = document.querySelector('.header__actions button');
  const dialog = document.querySelector<HTMLDialogElement>('.login');
  const form = document.querySelector<HTMLFormElement>('.login__form');
  const closeButton = document.querySelector('.login__close');
  const emailInput = document.querySelector<HTMLInputElement>('#login-email');
  const passwordInput = document.querySelector<HTMLInputElement>('#login-password');
  const toggle = document.querySelector<HTMLButtonElement>('.login__toggle');

  if (!accountButton || !dialog || !form || !emailInput || !passwordInput || !toggle) return;

  form.noValidate = true;

  const closeDialog = (): void => {
    form.reset();
    clearError(emailInput);
    clearError(passwordInput);
    setPasswordVisible(passwordInput, toggle, false);
    dialog.close();
  };

  accountButton.addEventListener('click', () => {
    dialog.showModal();
  });

  closeButton?.addEventListener('click', (event) => {
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });

  toggle.addEventListener('click', () => {
    setPasswordVisible(passwordInput, toggle, passwordInput.type === 'password');
  });

  emailInput.addEventListener('input', () => clearError(emailInput));
  passwordInput.addEventListener('input', () => clearError(passwordInput));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    if (!email) {
      showError(emailInput, 'Email is required');
      isValid = false;
    } else if (!EMAIL_PATTERN.test(email)) {
      showError(emailInput, 'Enter a valid email, for example name@example.com');
      isValid = false;
    }

    if (!password.trim()) {
      showError(passwordInput, 'Password is required');
      isValid = false;
    }

    if (isValid) closeDialog();
  });
}
