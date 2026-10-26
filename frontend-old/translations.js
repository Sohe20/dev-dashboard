const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    team: "Team",
    profile: "My Profile",
    revenue: "Revenue",
    teamMembers: "Team Members",
    activityOverview: "Activity Overview",
    recentProjects: "Recent Projects",
    viewAllProjects: "View all projects",
    newProject: "+ New Project",
    newTask: "+ New Task",
    newMember: "+ New Member",
    search: "Search...",
    noProjects: "No projects yet.",
    noTasks: "No tasks yet.",
    noTeam: "No team members yet.",
    goodMorning: "Good morning",
    subTitle: "Here's what's happening with your projects today.",
    myProfile: "My Profile",
    yourTasks: "Your tasks and information.",
  },
  fa: {
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    tasks: "تسک‌ها",
    team: "تیم",
    profile: "پروفایل من",
    revenue: "درآمد",
    teamMembers: "اعضای تیم",
    activityOverview: "نمای فعالیت",
    recentProjects: "پروژه‌های اخیر",
    viewAllProjects: "مشاهده همه پروژه‌ها",
    newProject: "+ پروژه جدید",
    newTask: "+ تسک جدید",
    newMember: "+ عضو جدید",
    search: "جستجو...",
    noProjects: "هنوز پروژه‌ای نیست.",
    noTasks: "هنوز تسکی نیست.",
    noTeam: "هنوز عضوی نیست.",
    goodMorning: "صبح بخیر",
    subTitle: "اینجا وضعیت پروژه‌های امروز شماست.",
    myProfile: "پروفایل من",
    yourTasks: "تسک‌ها و اطلاعات شما.",
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key) {
  return translations[currentLang][key] || key;
}

function toggleLang() {
  currentLang = currentLang === 'en' ? 'fa' : 'en';
  localStorage.setItem('lang', currentLang);
  document.getElementById('btnLang').textContent = currentLang === 'fa' ? 'EN' : 'FA';
  applyTranslations();
  // reload current page content
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    const pageId = activePage.id.replace('page-', '');
    navigate(pageId);
  }
}

function applyTranslations() {
  // navbar tooltips
  document.querySelector('[data-page="dashboard"]').title = t('dashboard');
  document.querySelector('[data-page="projects"]').title = t('projects');
  document.querySelector('[data-page="tasks"]').title = t('tasks');
  document.querySelector('[data-page="team"]').title = t('team');
  document.querySelector('[data-page="settings"]').title = t('profile');

  // buttons
  const btnNewProject = document.getElementById('btnNewProject');
  if (btnNewProject) btnNewProject.innerHTML = `<i class="ti ti-plus"></i> ${t('newProject')}`;

  const btnNewTask = document.getElementById('btnNewTask');
  if (btnNewTask) btnNewTask.innerHTML = `<i class="ti ti-plus"></i> ${t('newTask')}`;

  const btnNewMember = document.getElementById('btnNewMember');
  if (btnNewMember) btnNewMember.innerHTML = `<i class="ti ti-plus"></i> ${t('newMember')}`;

  // search placeholder
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('search');

  // card titles
  const activityTitle = document.querySelector('.card-title');
  if (activityTitle) activityTitle.textContent = t('activityOverview');

  // stat labels
  document.querySelectorAll('.stat-label').forEach(el => {
    const key = el.dataset.key;
    if (key) el.textContent = t(key);
  });
}

// apply on load
if (localStorage.getItem('lang') === 'fa') {
  document.getElementById('btnLang') && 
    (document.getElementById('btnLang').textContent = 'EN');
}