// routes/applicants.js
import express from "express";
import * as service from "../services/applicants.service.js";

const router = express.Router();

/**
 * GET /applicants
 * - Retrieves all applications if no query parameters are provided.
 * - Retrieves applications for a specific project if projectId is provided.
 * - Retrieves applications made by a specific freelancer if freelancerId is provided.
 */
router.get("/", (req, res) => {
    const { projectId, freelancerId } = req.query;

    if (projectId && freelancerId) {
        // Return true for exisist match
        return res.json(service.doesApplicationExisist(projectId, freelancerId));
    }

    if (projectId) {
        // Get applications for a specific project
        return res.json(service.getApplicantsByProjectId(projectId));
    }

    if (freelancerId) {
        // Get applications made by a specific freelancer
        return res.json(service.getApplicationsByFreelancerId(freelancerId));
    }

    // Get all applications if no specific query is provided
    return res.json(service.getApplicants());
});

router.get("/projects/:id", (req, res) => {
    return res.json(service.getProjectsByApplicantId(req.params.id))
})

router.get("/freelancers/:id", (req, res) => {
    return res.json(service.getApplicantsByProjectId(req.params.id))
})

/**
 * POST /applicants
 * Creates a new application.
 * Request body should contain { projectId, freelancerId }.
 */
router.post("/", (req, res) => {
    console.log("here")
    const result = service.createApplication(req.body);

    // Return the response with the appropriate status code (201 for success, 409 for conflict/validation)
    return res.status(result.success).json(result.body);
});

/**
 * DELETE /applicants
 * Deletes all applications. (Use with caution, usually only for testing/admin)
 */
router.delete("/", (req, res) => {
    service.deleteAllApplications();
    res.status(204).send();
});

/**
 * DELETE /applicants/project/:projectId
 * Deletes all applications for a specific project.
 */
router.delete("/project/:projectId", (req, res) => {
    service.deleteApplicationsByProjectId(req.params.projectId);
    res.status(204).send();
});

/**
 * DELETE /applicants/freelancer/:freelancerId
 * Deletes all applications made by a specific freelancer.
 */
router.delete("/freelancer/:freelancerId", (req, res) => {
    service.deleteApplicationsByFreelancerId(req.params.freelancerId);
    res.status(204).send();
});

/**
 * DELETE /applicants/:projectId/:freelancerId
 * Deletes a specific application by project ID and freelancer ID.
 */
router.delete("/:projectId/:freelancerId", (req, res) => {
    const { projectId, freelancerId } = req.params;
    service.deleteApplication(projectId, freelancerId);
    res.status(204).send();
});

export const applicantsRouter = router;