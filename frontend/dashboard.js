const API = "http://localhost:3000";

const colors = [
  "#5c4fd6",
  "#40d080",
  "#40a0ff",
  "#d0a020",
  "#ff6080",
  "#a0ff80",
];

// Redirect to login if not authenticated
if (!localStorage.getItem("token")) {
  window.location.href = "Auth/login.html";
}

// --- Auth Headers ---
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// --- Get User From Token ---
function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

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
  if (pageName === "team") loadTeam();
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
    const res = await fetch(`${API}/projects`, { headers: authHeaders() });
    const data = await res.json();
    const list = document.getElementById("allProjectsList");
    if (!data.length) {
      list.innerHTML = '<div class="loading">No projects yet.</div>';
      return;
    }
    list.innerHTML = data
      .map(
        (p, i) => `
      <div class="project-item clickable">
        <div class="project-dot" style="background:${colors[i % colors.length]}"></div>
        <span class="project-name" onclick="showProjectTasks(${p.id}, '${p.name}')" style="cursor:pointer;flex:1">${p.name}</span>
        <div class="project-bar-wrap">
          <div class="project-bar" style="width:${p.progress}%;background:${colors[i % colors.length]}"></div>
        </div>
        <span class="project-pct">${p.progress}%</span>
        <div style="display:flex;gap:6px;margin-left:8px">
          <button onclick="editProject(${p.id}, '${p.name}', '${p.description}', ${p.progress}, '${p.status}')" style="background:none;border:none;color:#6060a0;cursor:pointer;font-size:16px"><i class="ti ti-pencil"></i></button>
          <button onclick="deleteProject(${p.id})" style="background:none;border:none;color:#6060a0;cursor:pointer;font-size:16px"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch {
    document.getElementById("allProjectsList").innerHTML =
      '<div class="loading">Could not load.</div>';
  }
}

// --- Delete Project ---
async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;
  try {
    await fetch(`${API}/projects/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadAllProjects();
    loadProjects();
  } catch {
    alert("Failed to delete project.");
  }
}

// --- Edit Project ---
function editProject(id, name, description, progress, status) {
  document.getElementById("inputName").value = name;
  document.getElementById("inputDesc").value = description;
  document.getElementById("inputProgress").value = progress;
  document.getElementById("inputStatus").value = status;
  openModal();

  const btn = document.getElementById("btnSubmit");
  btn.textContent = "Update Project";
  btn.onclick = async () => {
    const newName = document.getElementById("inputName").value.trim();
    const newDesc = document.getElementById("inputDesc").value.trim();
    const newProgress =
      parseInt(document.getElementById("inputProgress").value) || 0;
    const newStatus = document.getElementById("inputStatus").value;

    try {
      await fetch(`${API}/projects/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          progress: newProgress,
          status: newStatus,
        }),
      });
      closeModal();
      loadAllProjects();
      loadProjects();
    } catch {
      alert("Failed to update project.");
    }
  };
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
    const res = await fetch(`${API}/tasks?projectId=${projectId}`, {
      headers: authHeaders(),
    });
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
    const res = await fetch(`${API}/tasks`, { headers: authHeaders() });
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
    ${t.assignee ? `<span style="font-size:11px;color:#a08cff;margin-left:4px"><i class="ti ti-user"></i> ${t.assignee.name}</span>` : ""}
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
  const assigneeId = document.getElementById("inputTaskAssignee").value;

  if (!title) return alert("Title is required.");

  try {
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        description,
        status,
        projectId: projectId ? +projectId : null,
        assigneeId: assigneeId ? +assigneeId : null,
      }),
    });
    closeTaskModal();
    loadTasks();
  } catch {
    alert("Failed to create task.");
  }
}
// --- Delete Task ---
async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await fetch(`${API}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTasks();
    loadTaskCount();
  } catch {
    alert("Failed to delete task.");
  }
}

// --- Edit Task ---
function editTask(id, title, description, status) {
  document.getElementById("inputTaskTitle").value = title;
  document.getElementById("inputTaskDesc").value = description;
  document.getElementById("inputTaskStatus").value = status;
  openTaskModal();

  const btn = document.getElementById("btnTaskSubmit");
  btn.textContent = "Update Task";
  btn.onclick = async () => {
    const newTitle = document.getElementById("inputTaskTitle").value.trim();
    const newDesc = document.getElementById("inputTaskDesc").value.trim();
    const newStatus = document.getElementById("inputTaskStatus").value;
    const projectId = document.getElementById("inputTaskProject").value;

    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          status: newStatus,
          projectId: projectId ? +projectId : null,
        }),
      });
      closeTaskModal();
      loadTasks();
      loadTaskCount();
    } catch {
      alert("Failed to update task.");
    }
  };
}

// --- Task Modal ---
async function openTaskModal() {
  document.getElementById("modalTaskOverlay").classList.add("open");
  try {
    const [projectsRes, usersRes] = await Promise.all([
      fetch(`${API}/projects`, { headers: authHeaders() }),
      fetch(`${API}/users`, { headers: authHeaders() }),
    ]);
    const projects = await projectsRes.json();
    const users = await usersRes.json();

    const projectSelect = document.getElementById("inputTaskProject");
    projectSelect.innerHTML = '<option value="">-- Select Project --</option>';
    projects.forEach((p) => {
      projectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });

    const assigneeSelect = document.getElementById("inputTaskAssignee");
    assigneeSelect.innerHTML = '<option value="">-- Select Member --</option>';
    users.forEach((u) => {
      assigneeSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    });
  } catch {
    console.error("Could not load data.");
  }
}

function closeTaskModal() {
  document.getElementById("modalTaskOverlay").classList.remove("open");
  document.getElementById("inputTaskTitle").value = "";
  document.getElementById("inputTaskDesc").value = "";
  document.getElementById("inputTaskProject").value = "";
  document.getElementById("inputTaskAssignee").value = "";
  const btn = document.getElementById("btnTaskSubmit");
  btn.textContent = "Create Task";
  btn.onclick = createTask;
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
    const res = await fetch(`${API}/projects`, { headers: authHeaders() });
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
      headers: authHeaders(),
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
  const btn = document.getElementById("btnSubmit");
  btn.textContent = "Create Project";
  btn.onclick = createProject;
}

// --- Load Task Count ---
async function loadTaskCount() {
  try {
    const res = await fetch(`${API}/tasks`, { headers: authHeaders() });
    const data = await res.json();
    document.getElementById("statTasks").textContent = data.length;
  } catch {
    document.getElementById("statTasks").textContent = "0";
  }
}

// --- Load Team ---
async function loadTeam() {
  try {
    const res = await fetch(`${API}/team`, { headers: authHeaders() });
    const data = await res.json();
    document.getElementById("statTeam").textContent = data.length;
    const list = document.getElementById("teamList");
    if (!data.length) {
      list.innerHTML = '<div class="loading">No team members yet.</div>';
      return;
    }
    list.innerHTML = data
      .map(
        (m) => `
      <div class="project-item">
        <div class="stat-icon blue" style="width:36px;height:36px;border-radius:50%;font-size:14px;font-weight:600;flex-shrink:0">
          ${m.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1">
          <div style="font-size:13px;color:#e0e0ff">${m.name}</div>
          <div style="font-size:11px;color:#6060a0">${m.role}</div>
        </div>
        <span style="font-size:11px;color:#6060a0">${m.email}</span>
        <div style="display:flex;gap:6px;margin-left:8px">
          <button onclick="deleteMember(${m.id})" style="background:none;border:none;color:#6060a0;cursor:pointer;font-size:16px"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch {
    document.getElementById("teamList").innerHTML =
      '<div class="loading">Could not load team.</div>';
  }
}

// --- Create Team Member ---
async function createMember() {
  const select = document.getElementById("inputMemberUser");
  const selectedOption = select.options[select.selectedIndex];
  const role = document.getElementById("inputMemberRole").value.trim();

  if (!select.value || !role)
    return alert("Please select a user and enter a role.");

  const name = selectedOption.dataset.name;
  const email = selectedOption.dataset.email;

  try {
    await fetch(`${API}/team`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, email, role }),
    });
    closeMemberModal();
    loadTeam();
  } catch {
    alert("Failed to add member.");
  }
}

// --- Delete Member ---
async function deleteMember(id) {
  if (!confirm("Remove this member?")) return;
  try {
    await fetch(`${API}/team/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTeam();
  } catch {
    alert("Failed to delete member.");
  }
}

// --- Member Modal ---
async function openMemberModal() {
  document.getElementById("modalMemberOverlay").classList.add("open");
  try {
    const res = await fetch(`${API}/users`, { headers: authHeaders() });
    const users = await res.json();
    const select = document.getElementById("inputMemberUser");
    select.innerHTML = '<option value="">-- Select User --</option>';
    users.forEach((u) => {
      select.innerHTML += `<option value="${u.id}" data-name="${u.name}" data-email="${u.email}">${u.name} (${u.email})</option>`;
    });
  } catch {
    console.error("Could not load users.");
  }
}
function closeMemberModal() {
  document.getElementById("modalMemberOverlay").classList.remove("open");
  document.getElementById("inputMemberUser").value = "";
  document.getElementById("inputMemberRole").value = "";
}
// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  const user = getUserFromToken();
  if (user) {
    document.querySelector("#page-dashboard .greeting h1").textContent =
      `Good morning, ${user.name} 👋`;
    document.querySelector(".avatar").textContent = user.name
      .charAt(0)
      .toUpperCase();
  }

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Auth/login.html";
  });

  const canvas = document.getElementById("activityChart");
  drawChart(canvas);
  window.addEventListener("resize", () => drawChart(canvas));

  loadProjects();
  loadTaskCount();
  loadTeam();

  document.getElementById("statRevenue").textContent = "$42,430";

  document.getElementById("btnNewProject").addEventListener("click", openModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("btnCancel").addEventListener("click", closeModal);
  document.getElementById("btnSubmit").onclick = createProject;
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

  document
    .getElementById("btnNewMember")
    .addEventListener("click", openMemberModal);
  document
    .getElementById("modalMemberClose")
    .addEventListener("click", closeMemberModal);
  document
    .getElementById("btnMemberCancel")
    .addEventListener("click", closeMemberModal);
  document.getElementById("btnMemberSubmit").onclick = createMember;
  document
    .getElementById("modalMemberOverlay")
    .addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeMemberModal();
    });

  document.getElementById("viewAllProjects").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("projects");
  });
});
