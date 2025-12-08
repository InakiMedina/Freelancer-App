//services/applicants.service.js
import fs from "fs";
import path from "path";
import { AplicantsSchema } from "../models/applicants.schema.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

import * as projectService from "../services/projects.service.js";
import * as usersService from "../services/users.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, "..", "data", "applicants.json");

// const projectFilePath = path.join(__dirname, "..", "data", "projects.json");
// const usersFilePath = path.join(__dirname, "..", "data", "users.json");

const readFile = () => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return an empty array
            return [];
        }
        throw error;
    }
}
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const readProjectsFile = () => JSON.parse(fs.readFileSync(projectFilePath, "utf8"));
const writeProjectsFile = (data) => fs.writeFileSync(projectFilePath, JSON.stringify(data, null, 2))

const readUsersFile = () => JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
const writeUsersFile = (data) => fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2))

/**
 * Get all applicants.
 * @returns {Array} An array of all application records.
 */
export const getApplicants = () => readFile();

/**
 * Get applicants for a specific project.
 * @param {string} projectId The ID of the project.
 * @returns {Array} An array of application records for the project.
 */
export const getApplicationsByProjectId = (projectId) => {
    const data = readFile();
    return data.filter(applicant => applicant.projectId === projectId);
};

/**
 * Get applications submitted by a specific freelancer.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {Array} An array of application records by the freelancer.
 */
export const getApplicationsByFreelancerId = (freelancerId) => {
    const data = readFile();
    return data.filter(applicant => applicant.freelancerId === freelancerId);
};

/**
 * Get status of an application by its project and freelancer id
 * @param {string} projectId The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {string} the status of the app
 */

export const getStatusOfApplication = (projectId, freelancerId) => {
    const data = readFile();
    return data.map(app => {
        if( app.freelancerId === freelancerId &&
        app.projectId === projectId)
            return app
    })
};

/**
 * Get status of an application by its status and freelancer id
 * @param {string} status The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 * @returns {string} the status of the app
 */

export const getApplicationsBySatusAndFreelancerId = (status, freelancerId) => {
    const data = readFile();
    return data.filter(app => ( app.freelancerId === freelancerId &&
        app.status === status))
};



/**
 * Get applications submitted by a specific freelancer.
 * @param {string} freelancerId The ID of the freelancer.
 * @param {string} projectId The ID of the freelancer.
 * @returns {Boolean} An array of application records by the freelancer.
 */
export const doesApplicationExisist = (projectId, freelancerId) => {

    const data = readFile();
    return data.findIndex(applicant => (
        applicant.freelancerId === freelancerId &&
        applicant.projectId === projectId
        )
    ) == -1 ? false : true
};


/**
 * Get applications submitted by a specific freelancer.
 * @param {string} aplicantId The ID of the freelancer.
 * @returns {Array} An array of application records by the freelancer.
 */
export const getProjectsByApplicantId = (aplicantId) => {
    const data = readFile();
    const appsAndProjects = data.filter(applicant => applicant.freelancerId === aplicantId);
    const projects = appsAndProjects.map(app => {
        const project = projectService.getProjectById(app.projectId)
        if (project == null)
            console.log("project of id: " + app.projectId + " dosent exist anymore anymore")
        
        return project
    })
    return projects
}

/**
 * Get applications submitted by a specific freelancer.
 * @param {string} aplicantId The ID of the freelancer.
 * @returns {Array} An array of application records by the freelancer.
 */
export const getApplicantsByProjectId = (projectId) => {
    const data = readFile();
    const appsAndProjects = data.filter(applicant => applicant.projectId === projectId);
    const applicants = appsAndProjects.map(app => {
        const user = usersService.getUserById(app.freelancerId)
        if (!user)
            console.log("freelancer of id: " + app.freelancerId + "dosent exist anymore anymore")
        return user
    } )
    return applicants
}

/**
 * Creates a new application.
 * @param {object} applicationData The application data (projectId, freelancerId).
 * @returns {object} The result object containing success status and body (new application or error).
 */
export const createApplication = (applicationData) => {
    if (!applicationData.status)
        applicationData.status = 'pending'
    
    const result = AplicantsSchema.safeParse(applicationData); // validation
    if (!result.success) {
        return {
            'success': 409,
            'body': Object.assign(
                {"description": "Application insertion failed due to validation error"},
                result.error
            )
        };
    }

    const newApplication = result.data;
    const data = readFile();

    // Check if this application already exists (same projectId and freelancerId)
    const exists = data.some(app =>
        app.projectId === newApplication.projectId &&
        app.freelancerId === newApplication.freelancerId
    );

    
    if (exists) {
        return {
            'success': 409, // Conflict
            'body': {
                "description": "Freelancer has already applied to this project."
            }
        };
    }

    data.push(newApplication);
    writeFile(data);

    return {
        'success': 201,
        'body': newApplication
    };
};

/**
 * Deletes an application.
 * @param {string} projectId The ID of the project.
 * @param {string} freelancerId The ID of the freelancer.
 */
export const deleteApplication = (projectId, freelancerId) => {
    const data = readFile();
    const filtered = data.filter(app =>
        !(app.projectId === projectId && app.freelancerId === freelancerId)
    );
    writeFile(filtered);
};

/**
 * Deletes all applications for a specific project.
 * @param {string} projectId The ID of the project.
 */
export const deleteApplicationsByProjectId = (projectId) => {
    const data = readFile();
    const filtered = data.filter(app => app.projectId !== projectId);
    writeFile(filtered);
};

/**
 * Deletes all applications by a specific freelancer.
 * @param {string} freelancerId The ID of the freelancer.
 */
export const deleteApplicationsByFreelancerId = (freelancerId) => {
    const data = readFile();
    const filtered = data.filter(app => app.freelancerId !== freelancerId);
    writeFile(filtered);
};

/**
 * Deletes all application records.
 */
export const deleteAllApplications = () => {
    writeFile([]);
};


/**
 * Updates the status a specific application by project ID and freelancer ID
 * @param {string} freelancerId The ID of the freelancer.
 * @param {string} projectId The ID of the project.
 */
export const acceptApplicant = (projectId, freelancerId) => {
    let applicants = getApplicationsByProjectId(projectId)
    if (applicants.findIndex( app => app.freelancerId == freelancerId) == -1)
        return {
        'success': 404,
        'error': 'application not found'
    }

    let data = readFile();

    data = data.map(app => {
        if ( app.projectId == projectId)
            app.status = app.freelancerId == freelancerId ? "accepted" : "declined"
        return app
    })

    writeFile(data);

    return {
        'success': 202,
        'error': 'application status updated'
    }

};