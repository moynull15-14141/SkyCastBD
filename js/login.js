(() => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');

  if (!form || !window.SkyCastBDCms) return;

  if (window.SkyCastBDCms.getAdminToken()) {
    window.location.href = 'admin.html';
    return;
  }

  const setMessage = (text, type = 'info') => {
    message.textContent = text;
    message.dataset.type = type;
    message.hidden = !text;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submitButton.disabled = true;
    setMessage('Signing in securely...', 'info');

    try {
      const data = await window.SkyCastBDCms.login({
        username: String(formData.get('username') || '').trim(),
        password: String(formData.get('password') || '')
      });

      window.SkyCastBDCms.setAdminToken(data.token);
      setMessage('Login successful. Opening dashboard...', 'success');
      window.location.href = 'admin.html';
    } catch (error) {
      setMessage(error.message || 'Login failed.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
})();
