const API = 'http://localhost:3000';
let currentTab = 'login';

function switchTab(tab) {
  currentTab = tab;

  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');

  document.getElementById('fieldName').classList.toggle('show', tab === 'register');
  document.getElementById('btnSubmit').textContent = tab === 'login' ? 'Sign In' : 'Create Account';

  clearMessages();
}

function showError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('loginSuccess').classList.remove('show');
}

function showSuccess(msg) {
  const el = document.getElementById('loginSuccess');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('loginError').classList.remove('show');
}

function clearMessages() {
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('loginSuccess').classList.remove('show');
}

document.getElementById('btnSubmit').addEventListener('click', async () => {
  const email = document.getElementById('inputEmail').value.trim();
  const password = document.getElementById('inputPassword').value.trim();
  const name = document.getElementById('inputName').value.trim();

  if (!email || !password) return showError('Please fill in all fields.');
  if (currentTab === 'register' && !name) return showError('Please enter your name.');

  if (currentTab === 'login') {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return showError('Invalid email or password.');

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      window.location.href = '../index.html';
    } catch {
      showError('Could not connect to server.');
    }
  } else {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) return showError('Registration failed. Email may already exist.');

      showSuccess('Account created! You can now sign in.');
      switchTab('login');
    } catch {
      showError('Could not connect to server.');
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnSubmit').click();
});

// Hide name field on login tab initially
document.getElementById('fieldName').classList.remove('show');