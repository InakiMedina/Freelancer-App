//api/projects.js
export async function getProjects() {

	return await fetch('http://localhost:3000/api/project')
	.then(async function(response) {
		return await response.json();
	})
}

export async function getProjectById(id) {

	return await fetch('http://localhost:3000/api/project/' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function getProjectsByOwnerId(id) {

	return await fetch('http://localhost:3000/api/project/?ownerId=' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function getProjectsByStatus(status) {

	return await fetch('http://localhost:3000/api/project/?status=' + status)
	.then(async function(response) {
		return await response.json();
	})
}

export async function getOpenProjectsByFree(id) {

	return await fetch('http://localhost:3000/api/project/?status=open&freelancerId=' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function getInProgressProjectsByFree(id) {

	return await fetch('http://localhost:3000/api/project/?status=in_progres&freelancerId=' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function getDoneProjectsByFree(id) {

	return await fetch('http://localhost:3000/api/project/?status=done&freelancerId=' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function addProject(project) {

	return await fetch('http://localhost:3000/api/project',
	{
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(project)
	})
	.then(async function(response) {
		return await response.json();
	})
}

export async function deleteProject(id) {
	return await fetch('http://localhost:3000/api/project/' + id,
	{
		method: "DELETE"
	})
	.then(async function(response) {
		return await response.json();
	})
}

export async function updateProject(id, project) {
	return await fetch('http://localhost:3000/api/project/' + id,
	{
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(project)
	})
	.then(async function(response) {
		return await response.json();
	})
}