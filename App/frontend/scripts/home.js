import * as projectApi from '../api/projects.api.js'
import * as userApi from '../api/users.api.js'
import * as applicantApi from '../api/applicants.api.js'

// Data Models
const cache = {}

const UserTypes = {
	FREELANCER: 'freelancer',
	CLIENT: 'client'
};

const ProjectStatus = {
	OPEN: 'open',
	IN_PROGRESS: 'in_progress',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled'
};

const ApplicationStatus = {
	PENDING: 'pending',
	ACCEPTED: 'accepted',
	REJECTED: 'rejected'
};

// Sample Data (in a real app, this would come from a backend)
let users = JSON.parse(localStorage.getItem('users')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOM Elements
const landingPage = document.getElementById('landing-page');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

// Navigation
const navHome = document.getElementById('nav-home');
const navProjects = document.getElementById('nav-projects');
const navLogin = document.getElementById('nav-login');
const navRegister = document.getElementById('nav-register');
const navDashboard = document.getElementById('nav-dashboard');
const navLogout = document.getElementById('nav-logout');

// Auth Elements
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authAlert = document.getElementById('auth-alert');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchLink = document.getElementById('auth-switch-link');
const nameGroup = document.getElementById('name-group');
const userTypeGroup = document.getElementById('user-type-group');
const cvGroup = document.getElementById('cv-group');

// Dashboard Elements
const dashboardGreeting = document.getElementById('dashboard-greeting');
const freelancerOnly = Array.prototype.slice.call(document.getElementsByClassName('freelancer-only'));
const clientOnly = document.getElementById('client-only');
const dashboardLinks = document.querySelectorAll('.dashboard-link');
const dashboardContents = document.querySelectorAll('.dashboard-content');

// Project Modal
const projectModal = document.getElementById('project-modal');
const projectModalTitle = document.getElementById('project-modal-title');
const projectForm = document.getElementById('project-form');
const projectSubmitBtn = document.getElementById('project-submit-btn');
let projectCancelBtn = document.getElementById('project-cancel-btn');
let projectDeleteBtn = document.getElementById('project-delete-btn')
const projectApplicantsGroup = document.getElementById('project-applicants-group');

// Generates the X button HTML
function htmlXButton(onClickFnName) {
    return `
        <button class="x-close-btn" onclick="${onClickFnName}()">
            &times;
        </button>
    `;
}

function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("confirmOverlay");
        const msg = document.getElementById("confirmMessage");
        const okBtn = document.getElementById("confirmOk");
        const cancelBtn = document.getElementById("confirmCancel");

        msg.textContent = message;
        overlay.style.display = "flex";

        okBtn.onclick = () => {
            overlay.style.display = "none";
            resolve(true);
        };

        cancelBtn.onclick = () => {
            overlay.style.display = "none";
            resolve(false);
        };
    });
}

// Initialize App
function initApp() {
	updateNavigation();
	
	if (currentUser) {
		showDashboard();
	} else {
		showLandingPage();
	}
	
	setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
	// Navigation
	navHome.addEventListener('click', showLandingPage);
	navProjects.addEventListener('click', showProjectsPage);
	navLogin.addEventListener('click', showLoginForm);
	navRegister.addEventListener('click', showRegisterForm);
	navDashboard.addEventListener('click', showDashboard);
	navLogout.addEventListener('click', logout);
	
	// Auth
	authForm.addEventListener('submit', handleAuth);
	authSwitchLink.addEventListener('click', toggleAuthMode);
	
	// Dashboard
	dashboardLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			showDashboardSection(e.target.dataset.section);
		});
	});
	

	
	projectForm.addEventListener('submit', handleProjectSubmit);
	
	// Get Started Button
	document.getElementById('get-started-btn').addEventListener('click', showRegisterForm);
	
	// Create Project Button
	document.getElementById('create-project-btn').addEventListener('click', () => {
		showProjectModal();
	});
}

// Navigation Functions
function updateNavigation() {
	if (currentUser) {
		navLogin.classList.add('hidden');
		navRegister.classList.add('hidden');
		navDashboard.classList.remove('hidden');
		navLogout.classList.remove('hidden');
	} else {
		navLogin.classList.remove('hidden');
		navRegister.classList.remove('hidden');
		navDashboard.classList.add('hidden');
		navLogout.classList.add('hidden');
	}
}

function showLandingPage() {
	landingPage.classList.remove('hidden');
	authSection.classList.add('hidden');
	dashboardSection.classList.add('hidden');
}

function showProjectsPage() {
	if (currentUser) {
		showDashboard();
		showDashboardSection('projects');
	} else {
		showLoginForm();
	}
}

function showLoginForm() {
	landingPage.classList.add('hidden');
	authSection.classList.remove('hidden');
	dashboardSection.classList.add('hidden');
	
	setAuthMode('login');
}

function showRegisterForm() {
	landingPage.classList.add('hidden');
	authSection.classList.remove('hidden');
	dashboardSection.classList.add('hidden');
	
	setAuthMode('register');
}

function showDashboard() {
	landingPage.classList.add('hidden');
	authSection.classList.add('hidden');
	dashboardSection.classList.remove('hidden');
	
	updateDashboard();
	showDashboardSection('overview');
}

// Auth Functions
function setAuthMode(mode) {
	if (mode === 'login') {
		authTitle.textContent = 'Iniciar Sesión';
		authSubmitBtn.textContent = 'Iniciar Sesión';
		authSwitchText.innerHTML = '¿No tienes una cuenta? <a href="#" id="auth-switch-link">Regístrate</a>';
		nameGroup.style.display = 'none';
		userTypeGroup.style.display = 'none';
		cvGroup.style.display = 'none';
	} else {
		authTitle.textContent = 'Registrarse';
		authSubmitBtn.textContent = 'Registrarse';
		authSwitchText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="auth-switch-link">Inicia Sesión</a>';
		nameGroup.style.display = 'block';
		userTypeGroup.style.display = 'block';
		
		// Re-attach event listener after updating the DOM
		document.getElementById('auth-switch-link').addEventListener('click', toggleAuthMode);
		
		// Show CV field only for freelancers
		document.getElementById('user-type').addEventListener('change', (e) => {
			cvGroup.style.display = e.target.value === UserTypes.FREELANCER ? 'block' : 'none';
		});
	}
	
	// Clear form and alert
	authForm.reset();
	hideAlert();
}

function toggleAuthMode(e) {
	e.preventDefault();
	const isLogin = authTitle.textContent === 'Iniciar Sesión';
	setAuthMode(isLogin ? 'register' : 'login');
}

async function handleAuth(e) {
	e.preventDefault();
	
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	
	if (authTitle.textContent === 'Iniciar Sesión') {
		// Login
		const user = await userApi.login(email, password)
		
		if (user) {
			currentUser = user;
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
			updateNavigation();
			showDashboard();
		} else {
			showAlert('Credenciales incorrectas. Inténtalo de nuevo.', 'danger');
		}
	} else {
		// Register
		const name = document.getElementById('name').value;
		const userType = document.getElementById('user-type').value;
		const cvFile = document.getElementById('cv').files[0];
		
		// Check if user already exists
		if (await userApi.getUserByEmail(email)) {
			showAlert('Ya existe un usuario con este correo electrónico.', 'danger');
			return;
		}
		
		// Create new user
		const newUser = {
			name,
			email,
			password,
			type: userType,
			registrationDate: new Date().toISOString(),
			rating: 0,
			raitingCount: 0,
			educationLevel: '',
			occupation: '',
			currentWork: '',
			cv: cvFile ? cvFile.name : '',
			projects: []
		};
	
		currentUser = newUser;
		const signupRes = await userApi.addUser(newUser)
		if (!signupRes) {
			e.stopImmediatePropagation()
			alert("Server failed to add user");
			return
		}
		localStorage.setItem('currentUser', JSON.stringify(currentUser));
		
		updateNavigation();
		showDashboard();
	}
}

function logout() {
	currentUser = null;
	localStorage.removeItem('currentUser');
	updateNavigation();
	showLandingPage();
}

// Dashboard Functions
function updateDashboard() {
	dashboardGreeting.textContent = `Hola, ${currentUser.name}`;
	
	// Show/hide menu items based on user type
	
	if (currentUser.type === UserTypes.FREELANCER) 
		freelancerOnly.forEach(f => f.classList.remove('hidden'));
	else 
		freelancerOnly.forEach(f =>f.classList.add('hidden'));
	

	if (currentUser.type === UserTypes.CLIENT) 
		clientOnly.classList.remove('hidden');
	else
		clientOnly.classList.add('hidden');
		
	
	// Update overview content
	updateOverviewContent();
}

function showDashboardSection(section) {
	// Hide all sections
	dashboardContents.forEach(content => {
		content.classList.add('hidden');
	});
	
	// Remove active class from all links
	dashboardLinks.forEach(link => {
		link.classList.remove('active');
	});
	
	// Show selected section and set active link
	document.getElementById(`${section}-section`).classList.remove('hidden');
	document.querySelector(`[data-section="${section}"]`).classList.add('active');
	
	// Load section content
	switch(section) {
		case 'overview':
			updateOverviewContent();
			break;
		case 'profile':
			updateProfileContent();
			break;
		case 'projects':
			updateProjectsContent();
			break;
		case 'my-applications':
			updateMyApplicationsContent();
			break;
		case 'my-projects':
			updateMyProjectsContent();
			break;
	}
}

window.showDashboardSection = showDashboardSection

async function updateOverviewContent() {
	const overviewContent = document.getElementById('overview-content');
	
	if (currentUser.type === UserTypes.FREELANCER) {
		const myApplications = applications.filter(app => 
			app.freelancerId === currentUser.id
		);
		
		const activeProjects = await projectApi.getOpenProjectsByFree(currentUser.id)
		
		overviewContent.innerHTML = `
			<div class="card">
				<h3 class="card-title">Resumen de Actividad</h3>
				<p><strong>Postulaciones activas:</strong> ${myApplications.filter(app => app.status === ApplicationStatus.PENDING).length}</p>
				<p><strong>Proyectos en curso:</strong> ${activeProjects.length}</p>
				<p><strong>Proyectos completados:</strong> ${await projectApi.getDoneProjectsByFree(currentUser.id).length}</p>
				<p><strong>Rating promedio:</strong> ${currentUser.rating || 'Sin calificaciones'}</p>
			</div>
			<div class="card">
				<h3 class="card-title">Acciones Rápidas</h3>
				<button class="btn btn-primary" onclick="showDashboardSection('projects')">Buscar Proyectos</button>
				<button class="btn btn-outline" onclick="showDashboardSection('profile')">Editar Perfil</button>
			</div>
		`;
	} else {
		const myProjects = await projectApi.getProjectsByOwnerId(currentUser.id)
		overviewContent.innerHTML = `
			<div class="card">
				<h3 class="card-title">Resumen de Actividad</h3>
				<p><strong>Proyectos publicados:</strong> ${myProjects.length}</p>
				<p><strong>Proyectos en curso:</strong> ${myProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length}</p>
				<p><strong>Proyectos completados:</strong> ${myProjects.filter(p => p.status === ProjectStatus.COMPLETED).length}</p>
			</div>
			<div class="card">
				<h3 class="card-title">Acciones Rápidas</h3>
				<button class="btn btn-primary" onclick="showProjectModal()">Publicar Proyecto</button>
				<button class="btn btn-outline" onclick="showDashboardSection('my-projects')">Ver Mis Proyectos</button>
			</div>
		`;
	}
}

function updateProfileContent() {
	const profileContent = document.getElementById('profile-content');
	
	profileContent.innerHTML = `
		<form id="profile-form">
			<div class="form-group">
				<label class="form-label" for="profile-name">Nombre completo</label>
				<input type="text" class="form-control" id="profile-name" value="${currentUser.name}" required>
			</div>
			<div class="form-group">
				<label class="form-label" for="profile-email">Correo electrónico</label>
				<input type="email" class="form-control" id="profile-email" value="${currentUser.email}" required>
			</div>
			${currentUser.type === UserTypes.FREELANCER ? `
				<div class="form-group">
					<label class="form-label" for="profile-education">Nivel de educación</label>
					<input type="text" class="form-control" id="profile-education" value="${currentUser.educationLevel || ''}">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-occupation">Ocupación</label>
					<input type="text" class="form-control" id="profile-occupation" value="${currentUser.occupation || ''}">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-current-work">Trabajo actual/Escuela actual</label>
					<input type="text" class="form-control" id="profile-current-work" value="${currentUser.currentWork || ''}">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-cv">CV (PDF)</label>
					<input type="file" class="form-control" id="profile-cv" accept=".pdf">
					${currentUser.cv ? `<p>CV actual: ${currentUser.cv}</p>` : ''}
				</div>
			` : ''}
			<button type="submit" class="btn btn-primary">Guardar Cambios</button>
		</form>
	`;
	
	document.getElementById('profile-form').addEventListener('submit', async (e) => {
		e.preventDefault();
		
		// Update user data
		currentUser.name = document.getElementById('profile-name').value;
		currentUser.email = document.getElementById('profile-email').value;
		
		if (currentUser.type === UserTypes.FREELANCER) {
			currentUser.educationLevel = document.getElementById('profile-education').value;
			currentUser.occupation = document.getElementById('profile-occupation').value;
			currentUser.currentWork = document.getElementById('profile-current-work').value;
			
			const cvFile = document.getElementById('profile-cv').files[0];
			if (cvFile) {
				currentUser.cv = cvFile.name;
			}
		}
		
		// Update in users array
		const userIndex = users.findIndex(u => u.id === currentUser.id);
		if (userIndex !== -1) {
			await userApi.updateUser(currentUser.id, currentUser)
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
		}
		
		showAlert('Perfil actualizado correctamente.', 'success');
	});
}

async function updateProjectsContent() {
	const projectsContent = document.getElementById('projects-content');
	
	const openProjects = await projectApi.getProjectsByStatus(ProjectStatus.OPEN)
	
	if (openProjects.length === 0) {
		projectsContent.innerHTML = '<p>No hay proyectos disponibles en este momento.</p>';
		return;
	}
	
	let projectsHTML = '<div class="project-grid">';
	
	openProjects.forEach(project => {
		const owner = users.find(u => u.id === project.ownerId);
		const hasApplied = applications.some(app => 
			app.projectId === project.id && app.freelancerId === currentUser.id
		);
		
		projectsHTML += `
			<div class="project-card">
				<h3 class="card-title">${project.title}</h3>
				<p>${project.description.substring(0, 100)}...</p>
				<p><strong>Presupuesto:</strong> $${project.budget}</p>
				<p><strong>Cliente:</strong> ${owner ? owner.name : 'Desconocido'}</p>
				<p><strong>Categoría:</strong> ${formatCategory(project.category)}</p>
				${hasApplied ? 
					'<span class="badge badge-info">Ya postulado</span>' : 
					`<button class="btn btn-primary mt-20" onclick="applyToProject('${project.id}')">Postularme</button>`
				}
				<button class="btn btn-outline mt-20" onclick="viewProjectDetails('${project.id}')">Ver Detalles</button>
			</div>
		`;
	});
	
	projectsHTML += '</div>';
	projectsContent.innerHTML = projectsHTML;
}

async function updateMyApplicationsContent() {
	const myApplicationsContent = document.getElementById('my-applications-content');
	myApplicationsContent.innerHTML = ""
	
	const projectsApliedTo = await applicantApi.getProjectsByApplicantId(currentUser.id)
	
	if (projectsApliedTo.length === 0) {
		myApplicationsContent.innerHTML = '<p>No te has postulado a ningún proyecto aún.</p>';
		return;
	}
	
	let applicationsHTML = document.createElement('div')
	applicationsHTML.classList.add('project-grid')

	
	projectsApliedTo.forEach(async app => {
		const project = await projectApi.getProjectById(app.projectId)
		if (project == undefined) return;
		
		const tmp = `<div class="project-card">
				<h3 class="card-title">${project.title}</h3>
				<p>${project.description.substring(0, 100)}...</p>
				<p><strong>Estado:</strong> ${formatApplicationStatus(app.status)}</p>
				<p><strong>Presupuesto:</strong> $${project.budget}</p>
				<button class="btn btn-outline mt-20" onclick="viewProjectDetails('${project.id}')">Ver Detalles</button>
			</div>`
		
		applicationsHTML.innerHTML += tmp
	});
	
	myApplicationsContent.appendChild(applicationsHTML)
}

async function updateMyProjectsContent() {
	const myProjectsContent = document.getElementById('my-projects-content');
	
	const myProjects = await projectApi.getProjectsByOwnerId(currentUser.id)
	
	if (myProjects.length === 0) {
		myProjectsContent.innerHTML = '<p>No has creado ningún proyecto aún.</p>';
		return;
	}
	
	let projectsHTML = '<div class="project-grid">';
	
	myProjects.forEach(project => {
		const applicants = applications.filter(app => app.projectId === project.id);
		const assignedFreelancer = project.assignedFreelancerId ? 
			users.find(u => u.id === project.assignedFreelancerId) : null;
		
		projectsHTML += `
			<div class="project-card">
				<h3 class="card-title">${project.title}</h3>
				<p>${project.description.substring(0, 100)}...</p>
				<p><strong>Estado:</strong> ${formatProjectStatus(project.status)}</p>
				<p><strong>Presupuesto:</strong> $${project.budget}</p>
				<p><strong>Postulantes:</strong> ${applicants.length}</p>
				${assignedFreelancer ? `<p><strong>Freelancer asignado:</strong> ${assignedFreelancer.name}</p>` : ''}
				<button class="btn btn-outline mt-20" onclick="showProjectModal('${project.id}')">Editar</button>
				<button class="btn btn-primary mt-20" onclick="viewProjectDetails('${project.id}')">Ver Detalles</button>
			</div>
		`;
	});
	
	projectsHTML += '</div>';
	myProjectsContent.innerHTML = projectsHTML;
}

// Project Functions
async function showProjectModal(projectId = null) {
	if (!document.getElementById('project-description'))
		projectForm.innerHTML = cache.formData
	const isEdit = projectId !== null;

	const projectCancelBtn = document.getElementById('project-cancel-btn');
	const projectDeleteBtn = document.getElementById('project-delete-btn')

	projectCancelBtn.addEventListener('click', () => {
		projectModal.classList.add('hidden');
	});

	projectModalTitle.textContent = isEdit ? 'Editar Proyecto' : 'Crear Proyecto';
	projectSubmitBtn.textContent = isEdit ? 'Actualizar' : 'Crear';
	projectApplicantsGroup.style.display = 'none';
	
	if (isEdit) {
		
		projectDeleteBtn.classList.remove('hidden')	
		projectDeleteBtn.addEventListener('click', () => confirmProjectDeletion(projectId))

		const project = await projectApi.getProjectById(projectId);


		if (project) {
			document.getElementById('project-title').value = project.title;
			document.getElementById('project-description').value = project.description;
			document.getElementById('project-budget').value = project.budget;
			document.getElementById('project-category').value = project.category;
		}
	} else {
		projectDeleteBtn.classList.add('hidden')
		projectForm.reset();
	}
	
	projectModal.dataset.projectId = projectId
	//projectModal.classList.remove('hidden');
	projectModal.classList.remove('hidden')
}
window.showProjectModal = showProjectModal

async function confirmProjectDeletion(projectId) {

    const ok = await customConfirm("¿Estás seguro de que deseas borrar tu proyecto?");

    if (!ok) 
        return
    

	projectApi.deleteProject(projectId)
	closeModal("project-modal")
	updateMyProjectsContent()
    // continue with your logic...
}

async function handleProjectSubmit(e) {
	e.preventDefault();
	
	
	const title = document.getElementById('project-title').value;
	const description = document.getElementById('project-description').value;
	const budget = document.getElementById('project-budget').value;
	const category = document.getElementById('project-category').value;
	
	const isEdit = projectModalTitle.textContent === 'Editar Proyecto';

	if (isEdit) {
		const projectId = projectModal.dataset.projectId;

		const updatedProject = {
			title,
			description,
			budget: parseInt(budget),
			category,
			ownerId: currentUser.id,
			status: ProjectStatus.OPEN,
			creationDate: new Date().toISOString()
		}
		await projectApi.updateProject(projectId, updatedProject)
		
		showAlert('Proyecto editado exitosamente.', 'success');
		updateMyProjectsContent();
	} else {
		// Create new project
		const newProject = {
			title,
			description,
			budget: parseInt(budget),
			category,
			ownerId: currentUser.id,
			status: ProjectStatus.OPEN,
			creationDate: new Date().toISOString()
		};
		await projectApi.addProject(newProject)
		
		showAlert('Proyecto creado exitosamente.', 'success');
		updateMyProjectsContent();
	}
	
	projectModal.classList.add('hidden');
}

async function applyToProject(projectId) {
	if (currentUser.type === UserTypes.CLIENT) {
		showAlert('Solo los freelancers pueden postularse a proyectos.', 'danger');
		return;
	}

	// Check if already applied
	
	if (await applicantApi.doesApplicationExisist(projectId)) {
		showAlert('Ya te has postulado a este proyecto.', 'warning');
		return;
	}
	
	// Create application
	const newApplication = {
		projectId,
		freelancerId: currentUser.id,
	};
	
	await applicantApi.createApplication(newApplication);
	localStorage.setItem('applications', JSON.stringify(applications));
	
	showAlert('Te has postulado al proyecto exitosamente.', 'success');
	updateProjectsContent();
}
window.applyToProject = applyToProject

async function viewProjectDetails(projectId) {
	const project = await projectApi.getProjectById(projectId)
	
	const owner = users.find(u => u.id === project.ownerId);
	const projectApplications = applications.filter(app => app.projectId === projectId);
	const assignedFreelancer = project.assignedFreelancerId ? 
		users.find(u => u.id === project.assignedFreelancerId) : null;
	
	let modalContent = `
		<h2>${project.title}</h2>
		<p><strong>Descripción:</strong> ${project.description}</p>
		<p><strong>Presupuesto:</strong> $${project.budget}</p>
		<p><strong>Categoría:</strong> ${formatCategory(project.category)}</p>
		<p><strong>Estado:</strong> ${formatProjectStatus(project.status)}</p>
		<p><strong>Publicado por:</strong> ${owner ? owner.name : 'Desconocido'}</p>
		<p><strong>Fecha de publicación:</strong> ${new Date(project.creationDate).toLocaleDateString()}</p>
	`;
	
	if (currentUser.id === project.ownerId) {
		// Client view - show applicants
		modalContent += `<h3>Postulantes (${projectApplications.length})</h3>`;
		
		if (projectApplications.length > 0) {
			projectApplications.forEach(app => {
				const freelancer = users.find(u => u.id === app.freelancerId);
				if (!freelancer) return;
				
				modalContent += `
					<div class="card mt-20">
						<h4>${freelancer.name}</h4>
						<p><strong>Email:</strong> ${freelancer.email}</p>
						${freelancer.rating ? `<p><strong>Rating:</strong> ${freelancer.rating}/5</p>` : ''}
						${freelancer.occupation ? `<p><strong>Ocupación:</strong> ${freelancer.occupation}</p>` : ''}
						${freelancer.cv ? `<p><strong>CV:</strong> ${freelancer.cv}</p>` : ''}
						<p><strong>Estado de postulación:</strong> ${formatApplicationStatus(app.status)}</p>
						${app.status === ApplicationStatus.PENDING ? 
							`<button class="btn btn-primary mt-20" onclick="selectFreelancer('${project.id}', '${freelancer.id}')">Seleccionar</button>` : 
							''
						}
					</div>
				`;
			});
		} else {
			modalContent += '<p>No hay postulantes para este proyecto.</p>';
		}
	} else if (assignedFreelancer && assignedFreelancer.id === currentUser.id) {
		// Assigned freelancer view
		modalContent += `
			<div class="card mt-20">
				<h3>Eres el freelancer asignado</h3>
				<p>Ponte en contacto con el cliente para coordinar los detalles del proyecto.</p>
				${project.status === ProjectStatus.IN_PROGRESS ? 
					`<button class="btn btn-primary mt-20" onclick="completeProject('${project.id}')">Marcar como Completado</button>` : 
					''
				}
			</div>
		`;
	}
	
	// Show modal with project details
	projectModalTitle.textContent = 'Detalles del Proyecto';
	cache.formData = projectForm.innerHTML
	projectForm.innerHTML = modalContent;
	projectSubmitBtn.style.display = 'none';
	projectCancelBtn.textContent = 'Cerrar';
	projectModal.classList.remove('hidden');
}
window.viewProjectDetails = viewProjectDetails;
window.closeModal = function (modalName) {
    const modal = document.getElementById(modalName);
    modal.classList.add('hidden');
};

function selectFreelancer(projectId, freelancerId) {
	// Update project
	const projectIndex = projects.findIndex(p => p.id === projectId);
	if (projectIndex !== -1) {
		projects[projectIndex].assignedFreelancerId = freelancerId;
		projects[projectIndex].status = ProjectStatus.IN_PROGRESS;
		localStorage.setItem('projects', JSON.stringify(projects));
	}
	
	// Update application status
	const applicationIndex = applications.findIndex(app => 
		app.projectId === projectId && app.freelancerId === freelancerId
	);
	if (applicationIndex !== -1) {
		applications[applicationIndex].status = ApplicationStatus.ACCEPTED;
		localStorage.setItem('applications', JSON.stringify(applications));
	}
	
	// Reject other applications
	applications.forEach(app => {
		if (app.projectId === projectId && app.freelancerId !== freelancerId) {
			app.status = ApplicationStatus.REJECTED;
		}
	});
	localStorage.setItem('applications', JSON.stringify(applications));
	
	showAlert('Freelancer seleccionado exitosamente.', 'success');
	projectModal.classList.add('hidden');
	updateMyProjectsContent();
}

function completeProject(projectId) {
	const projectIndex = projects.findIndex(p => p.id === projectId);
	if (projectIndex !== -1) {
		projects[projectIndex].status = ProjectStatus.COMPLETED;
		localStorage.setItem('projects', JSON.stringify(projects));
		
		showAlert('Proyecto marcado como completado.', 'success');
		projectModal.classList.add('hidden');
		updateOverviewContent();
	}
}

function showAlert(message, type) {
	authAlert.textContent = message;
	authAlert.className = `alert alert-${type}`;
	authAlert.classList.remove('hidden');
	
	// Auto-hide after 5 seconds
	setTimeout(() => {
		hideAlert();
	}, 5000);
}

function hideAlert() {
	authAlert.classList.add('hidden');
}

function formatCategory(category) {
	const categories = {
		'web-development': 'Desarrollo Web',
		'mobile-development': 'Desarrollo Móvil',
		'design': 'Diseño',
		'writing': 'Redacción',
		'marketing': 'Marketing',
		'other': 'Otro'
	};
	
	return categories[category] || category;
}

function formatProjectStatus(status) {
	const statuses = {
		'open': 'Abierto',
		'in_progress': 'En Progreso',
		'completed': 'Completado',
		'cancelled': 'Cancelado'
	};
	
	return statuses[status] || status;
}

function formatApplicationStatus(status) {
	const statuses = {
		'pending': 'Pendiente',
		'accepted': 'Aceptado',
		'rejected': 'Rechazado'
	};
	
	return statuses[status] || status;
}

// Initialize the application
initApp();