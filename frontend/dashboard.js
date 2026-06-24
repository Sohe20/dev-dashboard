const API = 'http://localhost:3000';

const colors = ['#5c4fd6', '#40d080', '#40a0ff', '#d0a020', '#ff6080', '#a0ff80'];

// --- Chart ---
function drawChart(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 180;
  const data = [15, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, 80, 75, 90, 100];
  const labels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'];
  const pad = { left: 30, right: 10, top: 10, bottom: 20 };
  const max = 100;

  const px = (i) => pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right);
  const py = (v) => pad.top + (1 - v / max) * (h - pad.top - pad.bottom);

  ctx.clearRect(0, 0, w, h);

  // Grid
  [0, 25, 50, 75, 100].forEach(v => {
    ctx.beginPath();
    ctx.strokeStyle = '#1e1e3a';
    ctx.lineWidth = 0.5;
    ctx.moveTo(pad.left, py(v));
    ctx.lineTo(w - pad.right, py(v));
    ctx.stroke();
    ctx.fillStyle = '#44447a';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(v, pad.left - 6, py(v) + 4);
  });

  // Labels
  labels.forEach((l, i) => {
    const xi = Math.round(i * (data.length - 1) / 4);
    ctx.fillStyle = '#44447a';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(l, px(xi), h - 4);
  });

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(92,79,214,0.35)');
  grad.addColorStop(1, 'rgba(92,79,214,0)');
  ctx.beginPath();
  data.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
  ctx.lineTo(px(data.length - 1), h - pad.bottom);
  ctx.lineTo(px(0), h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#7c6fff';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  data.forEach((v, i) => i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
  ctx.stroke();
}

// --- Render Projects ---
function renderProjects(projects) {
  const list = document.getElementById('projectsList');
  if (!projects.length) {
    list.innerHTML = '<div class="loading">No projects yet.</div>';
    return;
  }
  list.innerHTML = projects.slice(0, 4).map((p, i) => `
    <div class="project-item">
      <div class="project-dot" style="background:${colors[i % colors.length]}"></div>
      <span class="project-name">${p.name}</span>
      <div class="project-bar-wrap">
        <div class="project-bar" style="width:${p.progress}%;background:${colors[i % colors.length]}"></div>
      </div>
      <span class="project-pct">${p.progress}%</span>
    </div>
  `).join('');
}

// --- Load Data ---
async function loadProjects() {
  try {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    document.getElementById('statProjects').textContent = data.length;
    renderProjects(data);
  } catch {
    document.getElementById('projectsList').innerHTML = '<div class="loading">Could not load projects.</div>';
  }
}

// --- Create Project ---
async function createProject() {
  const name = document.getElementById('inputName').value.trim();
  const description = document.getElementById('inputDesc').value.trim();
  const progress = parseInt(document.getElementById('inputProgress').value) || 0;
  const status = document.getElementById('inputStatus').value;

  if (!name || !description) return alert('Name and description are required.');

  try {
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, progress, status }),
    });
    closeModal();
    loadProjects();
  } catch {
    alert('Failed to create project.');
  }
}

// --- Modal ---
function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('inputName').value = '';
  document.getElementById('inputDesc').value = '';
  document.getElementById('inputProgress').value = '';
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('activityChart');
  drawChart(canvas);
  window.addEventListener('resize', () => drawChart(canvas));

  loadProjects();

  // Placeholder stats
  document.getElementById('statTasks').textContent = '8';
  document.getElementById('statTeam').textContent = '12';
  document.getElementById('statRevenue').textContent = '$42,430';

  document.getElementById('btnNewProject').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('btnCancel').addEventListener('click', closeModal);
  document.getElementById('btnSubmit').addEventListener('click', createProject);

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});