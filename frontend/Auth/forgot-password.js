// const API = "https://dev-dashboard-production-a2de.up.railway.app";

const API = "http://localhost:3000";

async function resetPassword() {
  const email = document.getElementById('resetEmail').value.trim();
  const newPass = document.getElementById('resetNewPass').value;
  const confirmPass = document.getElementById('resetConfirmPass').value;
  const errorEl = document.getElementById('resetError');
  const successEl = document.getElementById('resetSuccess');

  errorEl.classList.remove('show');
  successEl.classList.remove('show');

  if (!email || !newPass || !confirmPass) {
    errorEl.textContent = 'Please fill all fields.';
    errorEl.classList.add('show');
    return;
  }

  if (newPass !== confirmPass) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.classList.add('show');
    return;
  }

  if (newPass.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    errorEl.classList.add('show');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword: newPass }),
    });

    if (res.ok) {
      successEl.textContent = 'Password changed! Redirecting...';
      successEl.classList.add('show');
      setTimeout(() => window.location.href = 'login.html', 2000);
    } else {
      errorEl.textContent = 'Email not found.';
      errorEl.classList.add('show');
    }
  } catch {
    errorEl.textContent = 'Could not connect to server.';
    errorEl.classList.add('show');
  }
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass ? '<i class="ti ti-eye-off"></i>' : '<i class="ti ti-eye"></i>';
}