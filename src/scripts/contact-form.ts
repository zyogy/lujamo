type Messages = Record<string, string>;
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Which message key applies to a field right now, or null if it is valid. */
function problem(field: Field): string | null {
  const value = field instanceof HTMLInputElement && field.type === 'checkbox' ? (field.checked ? 'x' : '') : field.value.trim();
  switch (field.name) {
    case 'name':
      return value ? null : 'nameRequired';
    case 'email':
      return !value ? 'emailRequired' : EMAIL.test(value) ? null : 'emailInvalid';
    case 'topic':
      return value ? null : 'topicRequired';
    case 'message':
      return !value ? 'messageRequired' : value.length < 10 ? 'messageShort' : null;
    case 'consent':
      return value ? null : 'consentRequired';
    default:
      return null;
  }
}

export function initContactForm(form: HTMLFormElement) {
  const messages: Messages = JSON.parse(form.dataset.messages ?? '{}');
  const configured = form.dataset.configured === 'true';
  const summary = form.querySelector<HTMLElement>('[data-error-summary]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const fields = Array.from(form.querySelectorAll<Field>('input[name], select[name], textarea[name]')).filter(
    (f) => f.type !== 'hidden' && f.name !== 'botcheck',
  );
  let attempted = false;

  form.noValidate = true;

  // Preselect the topic from ?topic=turva (links from product and division pages)
  const topic = new URLSearchParams(location.search).get('topic');
  const select = form.querySelector<HTMLSelectElement>('select[name="topic"]');
  if (topic && select && Array.from(select.options).some((o) => o.value === topic)) select.value = topic;

  function showError(field: Field, key: string | null) {
    const id = `${field.id}-error`;
    let error = document.getElementById(id);
    if (key) {
      if (!error) {
        error = document.createElement('p');
        error.id = id;
        error.className = 'field__error';
        field.closest('.field')?.append(error);
      }
      error.textContent = messages[key];
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', id);
    } else {
      error?.remove();
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  function validate() {
    const errors: { field: Field; key: string }[] = [];
    for (const field of fields) {
      const key = problem(field);
      showError(field, key);
      if (key) errors.push({ field, key });
    }
    return errors;
  }

  // After the first attempt, errors update as the visitor fixes them
  for (const field of fields) {
    const recheck = () => attempted && showError(field, problem(field));
    field.addEventListener('blur', recheck);
    field.addEventListener('change', recheck);
  }

  function setStatus(text: string, isError = false) {
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    attempted = true;
    setStatus('');

    const errors = validate();
    if (errors.length) {
      summary.querySelector('p')!.textContent = messages.summary;
      const list = summary.querySelector('ul')!;
      list.replaceChildren(
        ...errors.map(({ field, key }) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${field.id}`;
          a.textContent = messages[key];
          a.addEventListener('click', (e) => {
            e.preventDefault();
            field.focus();
          });
          li.append(a);
          return li;
        }),
      );
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    if (!configured) {
      setStatus(messages.notConfigured, true);
      return;
    }

    const data = new FormData(form);
    data.delete('redirect'); // we show the result in-page instead
    const topicLabel = select?.selectedOptions[0]?.textContent?.trim();
    if (topicLabel) data.set('subject', `Lujamo: ${topicLabel}`);

    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = messages.sending;
    try {
      const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error('send failed');
      form.reset();
      attempted = false;
      setStatus(messages.success);
    } catch {
      setStatus(messages.errorSend, true);
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
