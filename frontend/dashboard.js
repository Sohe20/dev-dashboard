const API = "http://localhost:3000";

const colors = [
  "#5c4fd6",
  "#40d080",
  "#40a0ff",
  "#d0a020",
  "#ff6080",
  "#a0ff80",
];

// --- Navigation ---
function navigate(pageName) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  document.getElementById(`page-${pageName}`).classList.add("active");
  document.querySelector(`[data-page="${pageName}"]`).classList.add("active");

  if (pageName === "projects") loadAllProjects();
  if (pageName === "dashboard") loadProjects();
  if (pageName === "tasks") loadTasks();
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});

// --- Load All Projects (Projects page) ---
async function loadAllProjects() {
  try {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    const list = document.getElementById("allProjectsList");
    if (!data.length) {
      list.innerHTML = '<div class="loading">No projects yet.</div>';
      return;
    }
    list.innerHTML = data
      .map(
        (p, i) => `
      <div class="project-item clickable" onclick="showProjectTasks(${p.id}, '${p.name}')">
        <div class="project-dot" style="background:${colors[i % colors.length]}"></div>
        <span class="project-name">${p.name}</span>
        <div class="project-bar-wrap">
          <div class="project-bar" style="width:${p.progress}%;background:${colors[i % colors.length]}"></div>
        </div>
        <span class="project-pct">${p.progress}%</span>
        <i class="ti ti-chevron-right" style="color:#6060a0;margin-left:8px"></i>
      </div>
    `,
      )
      .join("");
  } catch {
    document.getElementById("allProjectsList").innerHTML =
      '<div class="loading">Could not load.</div>';
  }
}

// --- Show Project Tasks ---
async function showProjectTasks(projectId, projectName) {
  const list = document.getElementById("allProjectsList");
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <button onclick="loadAllProjects()" style="background:none;border:none;color:#a08cff;cursor:pointer;font-size:13px">
        <i class="ti ti-arrow-left"></i> Back
      </button>
      <span style="font-size:14px;font-weight:600;color:#e0e0ff">${projectName}</span>
    </div>
    <div id="projectTasksList"><div class="loading">Loading...</div></div>
  `;
  try {
    const res = await fetch(`${API}/tasks?projectId=${projectId}`);
    const tasks = await res.json();
    const taskList = document.getElementById("projectTasksList");
    if (!tasks.length) {
      taskList.innerHTML =
        '<div class="loading">No tasks for this project.</div>';
      return;
    }
    taskList.innerHTML = tasks
      .map(
        (t) => `
      <div class="project-item">
        <div class="project-dot" style="background:${t.status === "done" ? "#40d080" : t.status === "inprogress" ? "#40a0ff" : "#6060a0"}"></div>
        <span class="project-name">${t.title}</span>
        <span class="project-pct" style="background:${t.status === "done" ? "#1a3a20" : "#1a1a30"};padding:2px 8px;border-radius:6px;font-size:11px">${t.status}</span>
      </div>
    `,
      )
      .join("");
  } catch {
    document.getElementById("projectTasksList").innerHTML =
      '<div class="loading">Could not load tasks.</div>';
  }
}

// --- Load Tasks ---
async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    const statEl = document.getElementById("statTasks");
    if (statEl) statEl.textContent = data.length;
    const list = document.getElementById("tasksList");
    if (!data.length) {
      list.innerHTML = '<div class="loading">No tasks yet.</div>';
      return;
    }
    list.innerHTML = data
      .map(
        (t) => `
  <div class="project-item">
    <div class="project-dot" style="background:${t.status === "done" ? "#40d080" : t.status === "inprogress" ? "#40a0ff" : "#6060a0"}"></div>
    <span class="project-name">${t.title}</span>
    <span class="project-pct" style="background:${t.status === "done" ? "#1a3a20" : "#1a1a30"};padding:2px 8px;border-radius:6px;font-size:11px">${t.status}</span>
    <div style="display:flex;gap:6px;margin-left:auto">
      <button onclick="editTask(${t.id}, '${t.title}', '${t.description}', '${t.status}')" style="background:none;border:none;color:#6060a0;cursor:pointer;font-size:16px"><i class="ti ti-pencil"></i></button>
      <button onclick="deleteTask(${t.id})" style="background:none;border:none;color:#6060a0;cursor:pointer;font-size:16px"><i class="ti ti-trash"></i></button>
    </div>
  </div>
`,
      )
      .join("");
  } catch {
    document.getElementById("tasksList").innerHTML =
      '<div class="loading">Could not load tasks.</div>';
  }
}

// --- Create Task ---
async function createTask() {
  const title = document.getElementById("inputTaskTitle").value.trim();
  const description = document.getElementById("inputTaskDesc").value.trim();
  const status = document.getElementById("inputTaskStatus").value;
  const projectId = document.getElementById("inputTaskProject").value;

  if (!title) return alert("Title is required.");

  try {
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status,
        projectId: projectId ? +projectId : null,
      }),
    });
    closeTaskModal();
    loadTasks();
  } catch {
    alert("Failed to create task.");
  }
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    loadTasks();
    loadTaskCount();
  } catch {
    alert("Failed to delete task.");
  }
}

function editTask(id, title, description, status) {
  document.getElementById('inputTaskTitle').value = title;
  document.getElementById('inputTaskDesc').value = description;
  document.getElementById('inputTaskStatus').value = status;
  openTaskModal();

  const btn = document.getElementById('btnTaskSubmit');
  btn.textContent = 'Update Task';
  btn.onclick = async () => {
    const newTitle = document.getElementById('inputTaskTitle').value.trim();
    const newDesc = document.getElementById('inputTaskDesc').value.trim();
    const newStatus = document.getElementById('inputTaskStatus').value;
    const projectId = document.getElementById('inputTaskProject').value;

    try {
      await fetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, status: newStatus, projectId: projectId ? +projectId : null }),
      });
      closeTaskModal();
      loadTasks();
      loadTaskCount();
      btn.textContent = 'Create Task';
      btn.onclick = createTask;
    } catch {
      alert('Failed to update task.');
    }
  };
}

// --- Task Modal ---
async function openTaskModal() {
  document.getElementById("modalTaskOverlay").classList.add("open");
  try {
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();
    const select = document.getElementById("inputTaskProject");
    select.innerHTML = '<option value="">-- Select Project --</option>';
    projects.forEach((p) => {
      select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
  } catch {
    console.error("Could not load projects.");
  }
}

function closeTaskModal() {
  document.getElementById("modalTaskOverlay").classList.remove("open");
  document.getElementById("inputTaskTitle").value = "";
  document.getElementById("inputTaskDesc").value = "";
  document.getElementById("inputTaskProject").value = "";
}

// --- Chart ---
function drawChart(canvas) {
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = canvas.offsetWidth);
  const h = (canvas.height = 180);
  const data = [15, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, 80, 75, 90, 100];
  const labels = ["May 1", "May 8", "May 15", "May 22", "May 29"];
  const pad = { left: 30, right: 10, top: 10, bottom: 20 };
  const max = 100;

  const px = (i) =>
    pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right);
  const py = (v) => pad.top + (1 - v / max) * (h - pad.top - pad.bottom);

  ctx.clearRect(0, 0, w, h);

  [0, 25, 50, 75, 100].forEach((v) => {
    ctx.beginPath();
    ctx.strokeStyle = "#1e1e3a";
    ctx.lineWidth = 0.5;
    ctx.moveTo(pad.left, py(v));
    ctx.lineTo(w - pad.right, py(v));
    ctx.stroke();
    ctx.fillStyle = "#44447a";
    ctx.font = "10px Inter";
    ctx.textAlign = "right";
    ctx.fillText(v, pad.left - 6, py(v) + 4);
  });

  labels.forEach((l, i) => {
    const xi = Math.round((i * (data.length - 1)) / 4);
    ctx.fillStyle = "#44447a";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(l, px(xi), h - 4);
  });

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(92,79,214,0.35)");
  grad.addColorStop(1, "rgba(92,79,214,0)");
  ctx.beginPath();
  data.forEach((v, i) =>
    i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)),
  );
  ctx.lineTo(px(data.length - 1), h - pad.bottom);
  ctx.lineTo(px(0), h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#7c6fff";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  data.forEach((v, i) =>
    i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)),
  );
  ctx.stroke();
}

// --- Render Projects (Dashboard) ---
function renderProjects(projects) {
  const list = document.getElementById("projectsList");
  if (!projects.length) {
    list.innerHTML = '<div class="loading">No projects yet.</div>';
    return;
  }
  list.innerHTML = projects
    .slice(0, 4)
    .map(
      (p, i) => `
    <div class="project-item">
      <div class="project-dot" style="background:${colors[i % colors.length]}"></div>
      <span class="project-name">${p.name}</span>
      <div class="project-bar-wrap">
        <div class="project-bar" style="width:${p.progress}%;background:${colors[i % colors.length]}"></div>
      </div>
      <span class="project-pct">${p.progress}%</span>
    </div>
  `,
    )
    .join("");
}

// --- Load Projects (Dashboard) ---
async function loadProjects() {
  try {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    document.getElementById("statProjects").textContent = data.length;
    renderProjects(data);
  } catch {
    document.getElementById("projectsList").innerHTML =
      '<div class="loading">Could not load projects.</div>';
  }
}

// --- Create Project ---
async function createProject() {
  const name = document.getElementById("inputName").value.trim();
  const description = document.getElementById("inputDesc").value.trim();
  const progress =
    parseInt(document.getElementById("inputProgress").value) || 0;
  const status = document.getElementById("inputStatus").value;

  if (!name || !description) return alert("Name and description are required.");

  try {
    await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, progress, status }),
    });
    closeModal();
    loadProjects();
  } catch {
    alert("Failed to create project.");
  }
}

// --- Modal Project ---
function openModal() {
  document.getElementById("modalOverlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("inputName").value = "";
  document.getElementById("inputDesc").value = "";
  document.getElementById("inputProgress").value = "";
}

function closeTaskModal() {
  document.getElementById("modalTaskOverlay").classList.remove("open");
  document.getElementById("inputTaskTitle").value = "";
  document.getElementById("inputTaskDesc").value = "";
  document.getElementById("inputTaskProject").value = "";
  const btn = document.getElementById('btnTaskSubmit');
  btn.textContent = 'Create Task';
  btn.onclick = createTask;
}


async function loadTaskCount() {
  try {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    document.getElementById("statTasks").textContent = data.length;
  } catch {
    document.getElementById("statTasks").textContent = "0";
  }
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("activityChart");
  drawChart(canvas);
  window.addEventListener("resize", () => drawChart(canvas));

  loadProjects();
  loadTaskCount();

  document.getElementById("statTeam").textContent = "12";
  document.getElementById("statRevenue").textContent = "$42,430";

  document.getElementById("btnNewProject").addEventListener("click", openModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("btnCancel").addEventListener("click", closeModal);
  document.getElementById("btnSubmit").addEventListener("click", createProject);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document
    .getElementById("btnNewTask")
    .addEventListener("click", openTaskModal);
  document
    .getElementById("modalTaskClose")
    .addEventListener("click", closeTaskModal);
  document
    .getElementById("btnTaskCancel")
    .addEventListener("click", closeTaskModal);
  document.getElementById("btnTaskSubmit").onclick = createTask;
  document.getElementById("modalTaskOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeTaskModal();
  });

  document.getElementById("viewAllProjects").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("projects");
  });
});
