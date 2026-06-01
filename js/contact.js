(() => {
  const cms = window.SkyCastBDCms;
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');

  if (!cms || !form || !status) return;

  const setStatus = (message, type = 'info') => {
    status.textContent = message;
    status.dataset.type = type;
    status.hidden = !message;
  };

  const getPayload = () => {
    const formData = new FormData(form);
    return {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim()
    };
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus('Sending your message...', 'info');

    try {
      await cms.submitContactMessage(getPayload());
      form.reset();
      setStatus('Thank you! Your message has been sent successfully.', 'success');
    } catch (error) {
      setStatus(error.message || 'Unable to send your message. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
})();
