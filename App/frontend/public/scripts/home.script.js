import * as projectApi from "../api/projects.api.js";
import * as userApi from "../api/users.api.js";
import * as applicantApi from "../api/applicants.api.js";
import * as authApi from "../api/auth.api.js";

// Data Models

const UserTypes = {
  FREELANCER: "freelancer",
  CLIENT: "client",
};

const ProjectStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ApplicationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// Sample Data (in a real app, this would come from a backend)
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// DOM Elements
const landingPage = document.getElementById("landing-page");
const dashboardSection = document.getElementById("dashboard-section");

// Navigation
const navHome = document.getElementById("nav-home");
const navProjects = document.getElementById("nav-projects");
const navDashboard = document.getElementById("nav-dashboard");
const navLogout = document.getElementById("nav-logout");

const mainAlert = document.getElementById("main-alert");

// Dashboard Elements
const dashboardGreeting = document.getElementById("dashboard-greeting");
const freelancerOnly = Array.prototype.slice.call(
  document.getElementsByClassName("freelancer-only")
);
const clientOnly = document.getElementById("client-only");
const dashboardLinks = document.querySelectorAll(".dashboard-link");
const dashboardContents = document.querySelectorAll(".dashboard-content");

// Project Modal
const projectModal = document.getElementById("project-modal");
const projectModalTitle = document.getElementById("project-modal-title");
const projectForm = document.getElementById("project-form");
const projectSubmitBtn = document.getElementById("project-submit-btn");
let projectCancelBtn = document.getElementById("project-cancel-btn");
let projectDeleteBtn = document.getElementById("project-delete-btn");
const projectApplicantsGroup = document.getElementById(
  "project-applicants-group"
);

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
  setupEventListeners();
  showLandingPage();
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  navHome.addEventListener("click", showLandingPage);
  navProjects.addEventListener("click", showProjectsPage);
  navDashboard.addEventListener("click", showDashboard);
  navLogout.addEventListener("click", logout);

  // Dashboard
  dashboardLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showDashboardSection(e.target.dataset.section);
    });
  });

  projectForm.addEventListener("submit", handleProjectSubmit);

  // Create Project Button
  document
    .getElementById("create-project-btn")
    .addEventListener("click", () => {
      showProjectModal();
    });
}

function showLandingPage() {
  landingPage.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  updateDashboard();
}

function showProjectsPage() {
  showDashboard();
  showDashboardSection("projects");
}

function showDashboard() {
  landingPage.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  updateDashboard();
  showDashboardSection("overview");
}
window.showDashboard = showDashboard;

async function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");

  const response = await authApi.logout();

  if (response.ok) {
    // Once the backend confirms the cookie is cleared:
    window.location.href = "/auth";
  } else {
    console.error("Logout failed on the server.");
  }
}

// Dashboard Functions
function updateDashboard() {
  dashboardGreeting.textContent = `Hola, ${currentUser.name}`;

  // Show/hide menu items based on user type

  if (currentUser.type === UserTypes.FREELANCER)
    freelancerOnly.forEach((f) => f.classList.remove("hidden"));
  else freelancerOnly.forEach((f) => f.classList.add("hidden"));


  if (currentUser.type === UserTypes.CLIENT)
    clientOnly.classList.remove("hidden");
  else clientOnly.classList.add("hidden");

  // Update overview content
  updateOverviewContent();
}

function showDashboardSection(section) {
  // Hide all sections
  dashboardContents.forEach((content) => {
    content.classList.add("hidden");
  });

  // Remove active class from all links
  dashboardLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // Show selected section and set active link
  document.getElementById(`${section}-section`).classList.remove("hidden");
  document.querySelector(`[data-section="${section}"]`).classList.add("active");

  // Load section content
  switch (section) {
    case "overview":
      updateOverviewContent();
      break;
    case "profile":
      updateProfileContent();
      break;
    case "projects":
      updateProjectsContent();
      break;
    case "my-applications":
      updateMyApplicationsContent();
      break;
    case "my-projects":
      updateMyProjectsContent();
      break;
  }
}

window.showDashboardSection = showDashboardSection;

async function updateOverviewContent() {
  const overviewContent = document.getElementById("overview-content");

  if (currentUser.type === UserTypes.FREELANCER) {
    const activeProjects = await projectApi.getOpenProjectsByFree(
      currentUser.id
    );
    const pendingApplications =
      await applicantApi.getPendingApplicationsApplicantId(currentUser.id);
    const completed = await projectApi.getDoneProjectsByFree(currentUser.id);

    overviewContent.innerHTML = `
			<div class="card">
				<h3 class="card-title">Resumen de Actividad</h3>
				<p><strong>Postulaciones activas:</strong> ${pendingApplications.length}</p>
				<p><strong>Proyectos en curso:</strong> ${activeProjects.length}</p>
				<p><strong>Proyectos completados:</strong> ${completed.length}</p>
				<p><strong>Rating promedio:</strong> ${
          currentUser.rating || "Sin calificaciones"
        }</p>
			</div>
			<div class="card">
				<h3 class="card-title">Acciones Rápidas</h3>
				<button class="btn btn-primary" onclick="showDashboardSection('projects')">Buscar Proyectos</button>
				<button class="btn btn-outline" onclick="showDashboardSection('profile')">Editar Perfil</button>
			</div>
		`;
  } else {
    const myProjects = await projectApi.getProjectsByOwnerId(currentUser.id);
    const completed = await projectApi.getDoneProjectsByFree(currentUser.id);
    const in_progress = await projectApi.getInProgressProjectsByFree(
      currentUser.id
    );
    overviewContent.innerHTML = `
			<div class="card">
				<h3 class="card-title">Resumen de Actividad</h3>
				<p><strong>Proyectos publicados:</strong> ${myProjects.length}</p>
				<p><strong>Proyectos en curso:</strong> ${completed.length}</p>
				<p><strong>Proyectos completados:</strong> ${in_progress.length}</p>
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
  const profileContent = document.getElementById("profile-content");

  profileContent.innerHTML = `
		<form id="profile-form">
			<div class="form-group">
				<label class="form-label" for="profile-name">Nombre completo</label>
				<input type="text" class="form-control" id="profile-name" value="${
          currentUser.name
        }" required>
			</div>
			<div class="form-group">
				<label class="form-label" for="profile-email">Correo electrónico</label>
				<input type="email" class="form-control" id="profile-email" value="${
          currentUser.email
        }" required>
			</div>
			${
        currentUser.type === UserTypes.FREELANCER
          ? `
				<div class="form-group">
					<label class="form-label" for="profile-education">Nivel de educación</label>
					<input type="text" class="form-control" id="profile-education" value="${
            currentUser.educationLevel || ""
          }">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-occupation">Ocupación</label>
					<input type="text" class="form-control" id="profile-occupation" value="${
            currentUser.occupation || ""
          }">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-current-work">Trabajo actual/Escuela actual</label>
					<input type="text" class="form-control" id="profile-current-work" value="${
            currentUser.currentWork || ""
          }">
				</div>
				<div class="form-group">
					<label class="form-label" for="profile-cv">CV (PDF)</label>
					<input type="file" class="form-control" id="profile-cv" accept=".pdf">
					${currentUser.cv ? `<p>CV actual: ${currentUser.cv}</p>` : ""}
				</div>
			`
          : ""
      }
			<button type="submit" class="btn btn-primary">Guardar Cambios</button>
		</form>
	`;

  document
    .getElementById("profile-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Update user data
      currentUser.name = document.getElementById("profile-name").value;
      currentUser.email = document.getElementById("profile-email").value;

      if (currentUser.type === UserTypes.FREELANCER) {
        currentUser.educationLevel =
          document.getElementById("profile-education").value;
        currentUser.occupation =
          document.getElementById("profile-occupation").value;
        currentUser.currentWork = document.getElementById(
          "profile-current-work"
        ).value;

        const cvFile = document.getElementById("profile-cv").files[0];
        if (cvFile) {
          currentUser.cv = cvFile.name;
        }
      }
	  console.log(currentUser)

      // Update in users array
        await userApi.updateUser(currentUser.id, currentUser);
      	showAlert("Perfil actualizado correctamente.", mainAlert, "success");
    });
}

async function updateProjectsContent() {
  const projectsContent = document.getElementById("projects-content");

  const openProjects = await projectApi.getProjectsByStatus(ProjectStatus.OPEN);

  if (openProjects.length === 0) {
    projectsContent.innerHTML =
      "<p>No hay proyectos disponibles en este momento.</p>";
    return;
  }

  let projectsHTML = '<div class="project-grid">';

  const projectCardPromises = openProjects.map(async (project) => {
    // 1. Await all necessary API calls for the current project
    const hasApplied = await applicantApi.doesApplicationExist(
      project.id,
      currentUser.id
    );
    const owner = await userApi.getUserById(project.ownerId);

    // 2. Return the HTML string for the current project card
    return `
        <div class="project-card">
            <h3 class="card-title">${project.title}</h3>
            <p>${project.description.substring(0, 100)}...</p>
            <p><strong>Presupuesto:</strong> $${project.budget}</p>
            <p><strong>Cliente:</strong> ${
              owner ? owner.name : "Desconocido"
            }</p>
            <p><strong>Categoría:</strong> ${formatCategory(
              project.category
            )}</p>
            ${
              hasApplied
                ? `<button class="btn btn-danger" onclick="unapplyToProyect('${project.id}')">Despostularse</button>`
                : `<button class="btn btn-primary mt-20" onclick="applyToProject('${project.id}')">Postularme</button>`
            }
            <button class="btn btn-outline mt-20" onclick="viewProjectDetails('${project.id}')">Ver Detalles</button>
        </div>
    `;
  });

  // 3. Wait for all promises (all project cards) to resolve
  const projectsHTMLArray = await Promise.all(projectCardPromises);

  // 4. Join the array of HTML strings into one final string
  projectsHTML += projectsHTMLArray.join("");

  // Now you can safely insert projectsHTML into the DOM
  // ...

  projectsHTML += "</div>";
  projectsContent.innerHTML = projectsHTML;
}

async function updateMyApplicationsContent() {
  const myApplicationsContent = document.getElementById(
    "my-applications-content"
  );
  myApplicationsContent.innerHTML = "";

  const projectsApliedTo = await applicantApi.getProjectsByApplicantId(
    currentUser.id
  );
  if (projectsApliedTo.length === 0) {
    myApplicationsContent.innerHTML =
      "<p>No te has postulado a ningún proyecto aún.</p>";
    return;
  }

  let applicationsHTML = document.createElement("div");
  applicationsHTML.classList.add("project-grid");

  projectsApliedTo.forEach(async (project) => {
    if (project.status == "completed" && project.freelancerId != currentUser.id)
      return;

    const tmp = `<div class="project-card">
				<h3 class="card-title">${project.title}</h3>
				<p>${project.description.substring(0, 100)}...</p>
				<p><strong>Presupuesto:</strong> $${project.budget}</p>
				<button class="btn btn-outline mt-20" onclick="viewProjectDetails('${
          project.id
        }')">Ver Detalles</button>
			</div>`;

    applicationsHTML.innerHTML += tmp;
  });

  myApplicationsContent.appendChild(applicationsHTML);
}

async function updateMyProjectsContent() {
  const myProjectsContent = document.getElementById("my-projects-content");
  myProjectsContent.innerHTML = "";

  const myProjects = await projectApi.getProjectsByOwnerId(currentUser.id);
  if (myProjects.length === 0) {
    myProjectsContent.innerHTML = "<p>No has creado ningún proyecto aún.</p>";
    return;
  }

  let projectsHTML = document.createElement("div");
  projectsHTML.classList.add("project-grid");

  myProjects.forEach(async (project) => {
    const status = project.status;
    const apps = await applicantApi.getApplicationsByProjectId(project.id);
    const assignedFreelancer =
      status != "open"
        ? await userApi.getUserById(project.assignedFreelancerId)
        : null;

    switch (status) {
      case "open":
        projectsHTML.innerHTML += `
					<div class="project-card">
						<h3 class="card-title">${project.title}</h3>
						<p>${project.description.substring(0, 100)}...</p>
						<p>Este proyecto esta <strong>abierto</strong></p>
						<p><strong>Presupuesto:</strong> $${project.budget}</p>
						<p><strong>Postulantes:</strong> ${apps.length}</p>
						<button class="btn btn-outline mt-20" onclick="showProjectModal('${
              project.id
            }')">Editar</button>
						<button class="btn btn-primary mt-20" onclick="viewProjectDetails('${
              project.id
            }')">Ver Detalles</button>
					</div>
				`;
        break;
      case "in_progress":
        projectsHTML.innerHTML += `
					<div class="project-card">
						<h3 class="card-title">${project.title}</h3>
						<p>${project.description.substring(0, 100)}...</p>
						<p>Proyecto <strong>en trabajo</strong></p>
						<p><strong>Presupuesto:</strong> $${project.budget}</p>
						<p><strong>Freelancer asignado:</strong> ${assignedFreelancer.name}</p>
						<button class="btn btn-outline mt-20" onclick="showProjectModal('${
              project.id
            }')">Editar</button>
						<button class="btn btn-primary mt-20" onclick="viewProjectDetails('${
              project.id
            }')">Ver Detalles</button>
					</div>
				`;
        break;
      case "completed":
        projectsHTML.innerHTML += `
					<div class="project-card">
						<h3 class="card-title">${project.title}</h3>
						<p>${project.description.substring(0, 100)}...</p>
						<p><strong>Este proyecto esta</strong> terminado</p>
						<p><strong>Presupuesto:</strong> $${project.budget}</p>
						<p><strong>Postulantes:</strong> ${apps.length}</p>
						<p><strong>Freelancer asignado:</strong> ${assignedFreelancer.name}</p>
						<button class="btn btn-primary mt-20" onclick="viewProjectDetails('${
              project.id
            }')">Ver Detalles</button>
					</div>
				`;
        break;
    }
  });

  myProjectsContent.appendChild(projectsHTML);
}

// Project Functions
async function showProjectModal(projectId = null) {
  // if (!document.getElementById('project-description'))
  // 	projectForm.innerHTML = cache.formData
  const isEdit = projectId !== null;

  const projectCancelBtn = document.getElementById("project-cancel-btn");
  const projectDeleteBtn = document.getElementById("project-delete-btn");

  projectCancelBtn.addEventListener("click", () => {
    projectModal.classList.add("hidden");
  });

  projectModalTitle.textContent = isEdit ? "Editar Proyecto" : "Crear Proyecto";
  projectModalTitle.classList.remove("hidden");
  projectSubmitBtn.textContent = isEdit ? "Actualizar" : "Crear";
  projectSubmitBtn.style.display = "block";
  projectApplicantsGroup.style.display = "none";

  if (isEdit) {
    projectDeleteBtn.classList.remove("hidden");
    projectDeleteBtn.addEventListener("click", () =>
      confirmProjectDeletion(projectId)
    );

    const project = await projectApi.getProjectById(projectId);

    if (project) {
      document.getElementById("project-title").value = project.title;
      document.getElementById("project-description").value =
        project.description;
      document.getElementById("project-budget").value = project.budget;
      document.getElementById("project-category").value = project.category;
    }
  } else {
    projectDeleteBtn.classList.add("hidden");
    projectForm.reset();
  }

  projectModal.dataset.projectId = projectId;
  showInfoModalForm.classList.add("hidden");
  editModalForm.classList.remove("hidden");
  projectModal.classList.remove("hidden");
}
window.showProjectModal = showProjectModal;

async function confirmProjectDeletion(projectId) {
  const ok = await customConfirm(
    "¿Estás seguro de que deseas borrar tu proyecto?"
  );

  if (!ok) return;

  projectApi.deleteProject(projectId);
  closeModal("project-modal");
  updateMyProjectsContent();
  // continue with your logic...
}

async function handleProjectSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("project-title").value;
  const description = document.getElementById("project-description").value;
  const budget = document.getElementById("project-budget").value;
  const category = document.getElementById("project-category").value;

  const isEdit = projectModalTitle.classList.contains("hidden");

  if (isEdit) {
    const projectId = projectModal.dataset.projectId;

    const updatedProject = {
      title,
      description,
      budget: parseInt(budget),
      category,
      ownerId: currentUser.id,
      status: ProjectStatus.OPEN,
      creationDate: new Date().toISOString(),
    };
    await projectApi.updateProject(projectId, updatedProject);

    showAlert("Proyecto editado exitosamente.", mainAlert, "success");
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
      creationDate: new Date().toISOString(),
    };
    await projectApi.addProject(newProject);

    showAlert("Proyecto creado exitosamente.", mainAlert, "success");
    updateMyProjectsContent();
  }

  projectModal.classList.add("hidden");
}

async function applyToProject(projectId) {
  if (currentUser.type === UserTypes.CLIENT) {
    showAlert(
      "Solo los freelancers pueden postularse a proyectos.",
      mainAlert,
      "danger"
    );
    return;
  }

  // Check if already applied
  if (await applicantApi.doesApplicationExist(projectId, currentUser.id)) {
    showAlert("Ya te has postulado a este proyecto.", mainAlert, "warning");
    return;
  }

  // Create application
  const newApplication = {
    projectId,
    freelancerId: currentUser.id,
  };

  await applicantApi.createApplication(newApplication);

  showAlert("Te has postulado al proyecto exitosamente.", mainAlert, "success");
  updateProjectsContent();
}
window.applyToProject = applyToProject;

async function unapplyToProyect(projectId) {
	await applicantApi.deleteApplication(projectId, currentUser.id)
	updateProjectsContent()
  	showAlert("Tu postulación ha sido removida", mainAlert, "info");
}
window.unapplyToProyect = unapplyToProyect;

async function viewProjectDetails(projectId) {
  const project = await projectApi.getProjectById(projectId);

  const isOwner = currentUser.id === project.ownerId;
  const assignedFreelancerId = project.assignedFreelancerId
    ? project.assignedFreelancerId
    : null;
  const owner = await userApi.getUserById(project.ownerId);

  // let modalContent = `
  // 	<h2>${project.title}</h2>
  // 	<p><strong>Descripción:</strong> ${project.description}</p>
  // 	<p><strong>Presupuesto:</strong> $${project.budget}</p>
  // 	<p><strong>Categoría:</strong> ${formatCategory(project.category)}</p>
  // 	<p><strong>Estado:</strong> ${formatProjectStatus(project.status)}</p>
  // 	<p><strong>Publicado por:</strong> ${owner ? owner.name : 'Desconocido'}</p>
  // 	<p><strong>Fecha de publicación:</strong> ${new Date(project.creationDate).toLocaleDateString()}</p>
  // `;
  let modalContent = `
		<h3 class="section-title">Información General</h3>
        <div class="info-grid mb-4">
            <div class="info-item">
                <span class="info-label">Presupuesto:</span>
                <span class="info-value budget-value">$${project.budget}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Categoría:</span>
                <span class="info-value">${formatCategory(
                  project.category
                )}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Publicado por:</span>
                <span class="info-value">${
                  owner ? owner.name : "Desconocido"
                }</span>
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de publicación:</span>
                <span class="info-value">${new Date(
                  project.creationDate
                ).toLocaleDateString()}</span>
            </div>
        </div>`;

  // Case 1 & 2 & 3: Project Owner (Client) View

  if (isOwner) {
    if (project.status == "completed") {
      // CASE 1: Project is completed const assignedFreelancer = await userApi.getUserById(assignedFreelancerId);
      const assignedFreelancer = await userApi.getUserById(
        assignedFreelancerId
      );

      modalContent += `
					<div class="completion-status-section status-finished">
						<h3 class="section-title">Finalización del Proyecto</h3>
						<div class="completion-message">
							<p class="message-text">
								¡Este proyecto ha sido marcado como <b>Terminado</b>!
							</p>
							<p class="freelancer-info">
								Freelancer Asignado: <span class="assigned-name">${assignedFreelancer.name}</span>
							</p>
						</div>
					</div>
              
            `;
    } else if (!assignedFreelancerId) {
      // CASE 2: Client owns project, NO freelancer assigned (show applicants)
      const projectApplicants = await applicantApi.getApplicantsByProjectId(
        projectId
      );

      if (projectApplicants.length > 0) {
        modalContent += `<div class="applicants-list-header">
					<h3 class="applicants-title">Postulantes</h3>
					<span class="applicants-count">${projectApplicants.length}</span>
				</div>`;
        projectApplicants.forEach((freelancer) => {
          modalContent += `
                        <div class="applicant-card">
							<div class="applicant-header">
								<h4 class="applicant-name">${freelancer.name}</h4>
								${
                  freelancer.rating
                    ? `<span class="applicant-rating"><i class="fas fa-star"></i> ${freelancer.rating}/5</span>`
                    : ""
                }
							</div>
							<div class="applicant-details">
								<div class="detail-item">
									<span class="detail-label">Email:</span>
									<span class="detail-value">${freelancer.email}</span>
								</div>
								${
                  freelancer.occupation
                    ? `
									<div class="detail-item">
										<span class="detail-label">Ocupación:</span>
										<span class="detail-value">${freelancer.occupation}</span>
									</div>`
                    : ""
                }
								${
                  freelancer.cv
                    ? `
									<div class="detail-item">
										<span class="detail-label">CV:</span>
										<span class="detail-value cv-link">${freelancer.cv}</span>
									</div>`
                    : ""
                }
							</div>
							${
                project.status === ProjectStatus.OPEN
                  ? `<button class="btn btn-primary select-btn" onclick="selectFreelancer('${project.id}', '${freelancer.id}')">Seleccionar</button>`
                  : ""
              }
						</div>
                    `;
        });
      } else {
        modalContent += `<div class="applicants-list-header">
				<h3 class="applicants-title">No hay postulantes</h3>
			</div>`;
      }
    } else {
      // CASE 3: Client owns project, YES freelancer assigned (show freelancer data and contact prompt)
      const assignedFreelancer = await userApi.getUserById(
        assignedFreelancerId
      );

      modalContent += `
                <div class="card mt-20">
                    <h3>Freelancer Asignado: <b>${
                      assignedFreelancer.name
                    }</b></h3>
                    <p><strong>Email:</strong> ${assignedFreelancer.email}</p>
                    <p>Por favor, <b>póngase en contacto con el freelancer</b> para coordinar los detalles del proyecto.</p>
                    ${
                      project.status === ProjectStatus.IN_PROGRESS
                        ? `<button class="btn btn-primary mt-20" onclick="completeProject('${project.id}')">Marcar como Completado</button>`
                        : ""
                    }
                </div>
            `;
    }
  }

  // Case 4 & 5 & 6 & 7: Freelancer/Applicant View
  else {
    if (project.status == "completed") {
      modalContent += `
                <div class="card mt-20">
					<h3>Proyecto Terminado</h3>
                </div>
            `;
    } else if (!assignedFreelancerId) {
      const applied = await applicantApi.doesApplicationExist(
        projectId,
        currentUser.id
      );
      if (!applied) {
        // CASE 5: Freelancer NOT assigned, not applied user is NOT owner (hide applicants, show neutral message)
        modalContent += `
					<div class="card mt-20">
						<h3> Freelancer no escojido </h3>
						<p>El proyecto está abierto y a la espera de que se escoja un freelancer.</p>
						<p>El listado de postulantes es privado y visible solo para el dueño del proyecto.</p>
					</div>
				`;
      } else {
        // CASE 6: Freelancer NOT assigned, but user applied (hide applicants, show neutral message)
        modalContent += `
					<div class="card mt-20">
						<h3>Estas postulado</h3>
						<p>El proyecto sigue abierto y no se ha esojido a un freelancer. Si el cliente te escoje, te contactará.</p>
						<p>El listado de postulantes es privado y visible solo para el dueño del proyecto.</p>
					</div>
				`;
      }
    } else {
      // CASE 7: Freelancer IS assigned, user is NOT owner
      const assignedFreelancer = await userApi.getUserById(
        assignedFreelancerId
      );
      const isAssignedFreelancer =
        currentUser.id === project.assignedFreelancerId;

      modalContent += `<div class="card mt-20">`;

      if (isAssignedFreelancer) {
        // CASE 4a: YOU are the assigned freelancer
        modalContent += `
                    <h3>¡Felicidades! Has sido seleccionado.</h3>
                    <p>Por favor, <b>ponte en contacto con el cliente</b> (${owner.name}, email: ${owner.email}) para iniciar el proyecto.</p>
                `;
      } else {
        // CASE 4b: Another freelancer was chosen
        modalContent += `
                    <h3>Freelancer Asignado</h3>
                    <p>Otro freelancer (${assignedFreelancer.name}) ha sido elegido para este proyecto.</p>
                `;
      }

      modalContent += `</div>`;
    }
  }

  projectCancelBtn.addEventListener("click", () => {
    projectModal.classList.add("hidden");
  });

  projectModalTitle.classList.add("hidden");
  showInfoModalForm.innerHTML = modalContent;
  projectSubmitBtn.style.display = "none";
  projectCancelBtn.textContent = "Cerrar";
  showInfoModalForm.classList.remove("hidden");
  editModalForm.classList.add("hidden");
  projectModal.classList.remove("hidden");
}
window.viewProjectDetails = viewProjectDetails;
window.closeModal = function (modalName) {
  const modal = document.getElementById(modalName);
  modal.classList.add("hidden");
};

async function selectFreelancer(projectId, freelancerId) {
  // Update project
  const newProjectData = {
    assignedFreelancerId: freelancerId,
    status: ProjectStatus.IN_PROGRESS,
  };
  await projectApi.updateProject(projectId, newProjectData);

  // Update application status
  await applicantApi.acceptApplicant(projectId, freelancerId);

  showAlert("Freelancer seleccionado exitosamente.", mainAlert, "success");
  projectModal.classList.add("hidden");
  updateMyProjectsContent();
  updateDashboard();
}
window.selectFreelancer = selectFreelancer;

async function completeProject(projectId) {
  const newProject = {
    status: ProjectStatus.COMPLETED,
  };

  await projectApi.updateProject(projectId, newProject);
  showAlert("Proyecto marcado como completado.", mainAlert, "success");
  projectModal.classList.add("hidden");
  updateOverviewContent();
}
window.completeProject = completeProject;

function showAlert(message, element, type) {
  element.textContent = message;
  element.className = `alert alert-${type}`;
  element.classList.remove("hidden");

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideAlert(element);
  }, 5000);
}

function hideAlert(element) {
  element.classList.add("hidden");
}

function formatCategory(category) {
  const categories = {
    "web-development": "Desarrollo Web",
    "mobile-development": "Desarrollo Móvil",
    design: "Diseño",
    writing: "Redacción",
    marketing: "Marketing",
    other: "Otro",
  };

  return categories[category] || category;
}

function formatProjectStatus(status) {
  const statuses = {
    open: "Abierto",
    in_progress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return statuses[status] || status;
}

function formatApplicationStatus(status) {
  const statuses = {
    pending: "Pendiente",
    accepted: "Aceptado",
    rejected: "Rechazado",
  };

  return statuses[status] || status;
}

// Initialize the application
initApp();
