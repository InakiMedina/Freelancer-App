export async function getProjects() {

	return await fetch('http://localhost:3000/project')
	.then(async function(response) {
		return await response.json();
	})
}

export async function getProjectsFromOwnerId(id) {

	return await fetch('http://localhost:3000/project/?ownerId=' + id)
	.then(async function(response) {
		return await response.json();
	})
}

export async function addProject(project) {

	return await fetch('http://localhost:3000/project',
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