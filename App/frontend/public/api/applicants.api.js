//frontent/api/applicants.js
const API_BASE_URL = 'http://localhost:3000/api/applicants';

// --- GET Requests ---

/**
 * Fetches all applications.
 * @returns {Promise<Array>} A promise that resolves to an array of all application objects.
 */
export async function getApplicants() {
    return await fetch(API_BASE_URL)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches all applications for a specific project.
 * @param {string} projectId The ID of the project.
 * @returns {Promise<Array>} A promise that resolves to an array of application objects for the project.
 */
export async function getApplicationsByProjectId(projectId) {
    return await fetch(`${API_BASE_URL}?projectId=${projectId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches all applications submitted by a specific freelancer.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Array>} A promise that resolves to an array of application objects by the freelancer.
 */
export async function getApplicationsByFreelancerId(freelancerId) {
    return await fetch(`${API_BASE_URL}?freelancerId=${freelancerId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches boolean that describes wether a specific application exist.
 * @param {string} freelancerId The ID of the freelancer.
 * @param {string} projectId The ID of the project.
 * @returns {Promise<Boolean>} 
 */
export async function doesApplicationExist(projectId, freelancerId) {
    return await fetch(`${API_BASE_URL}?freelancerId=${freelancerId}&projectId=${projectId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches all projects that a freelancer applied to
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Array>} 
 */
export async function getProjectsByApplicantId(freelancerId) {
    return await fetch(`${API_BASE_URL}/projects/${freelancerId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches all the freelancers that applied to a project
 * @param {string} projectId The ID of the project.
 * @returns {Promise<Array>} 
 */
export async function getApplicantsByProjectId(projectId) {
    return await fetch(`${API_BASE_URL}/freelancers/${projectId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches the status of an application by sending its project and freelancer Id
 * @param {string} projectId The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Array>} 
 */
export async function getStatusOfApplication(projectId, freelancerId) {
    return await fetch(`${API_BASE_URL}/${projectId}/${freelancerId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}

/**
 * Fetches applications by status == pending and applicant id
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Array>} 
 */
export async function getPendingApplicationsApplicantId(freelancerId) {
    return await fetch(`${API_BASE_URL}/status/pending/${freelancerId}`)
        .then(async function(response) {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
}



// --- POST Request ---

/**
 * Submits a new application.
 * @param {object} application An object containing projectId and freelancerId.
 * @returns {Promise<object>} A promise that resolves to the created application object or an error response.
 */
export async function createApplication(application) {
    return await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(application)
    })
    .then(async function(response) {
        // Even for 409 Conflict, we want to return the body to show the error message
        return await response.json();
    });
}

// --- DELETE Requests ---

/**
 * Deletes a specific application.
 * @param {string} projectId The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object (status 204 on success).
 */
export async function deleteApplication(projectId, freelancerId) {
    return await fetch(`${API_BASE_URL}/${projectId}/${freelancerId}`, {
        method: "DELETE"
    });
}

/**
 * Deletes all applications for a specific project.
 * @param {string} projectId The ID of the project.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object (status 204 on success).
 */
export async function deleteApplicationsByProjectId(projectId) {
    return await fetch(`${API_BASE_URL}/project/${projectId}`, {
        method: "DELETE"
    });
}

/**
 * Deletes all applications submitted by a specific freelancer.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object (status 204 on success).
 */
export async function deleteApplicationsByFreelancerId(freelancerId) {
    return await fetch(`${API_BASE_URL}/freelancer/${freelancerId}`, {
        method: "DELETE"
    });
}

/**
 * Deletes all applications in the system.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object (status 204 on success).
 */
export async function deleteAllApplications() {
    return await fetch(API_BASE_URL, {
        method: "DELETE"
    });
}

// --- UPDATE Requests ---

/**
 * Changes the application status to accepted of said application and rejects the rest
 * @param {string} projectId The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object (status 204 on success).
 */

export async function acceptApplicant(projectId, freelancerId) {
    return await fetch(`${API_BASE_URL}/${projectId}/${freelancerId}`, {
        method: "PUT"
    });
}
