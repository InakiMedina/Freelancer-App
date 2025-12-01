const BASE = "http://localhost:3000/api/user";

export async function getUsers() {
  return await fetch(BASE)
    .then(async res => await res.json());
}

export async function getUserById(id) {
  return await fetch(`${BASE}/${id}`)
    .then(async res => await res.json());
}

export async function getUserByEmail(email) {
  return await fetch(`${BASE}/email/${email}`)
    .then(async res =>{
		const json = await res.json()
		console.log(json)
		console.log(json.hasOwnProperty("error"))
		if (json.hasOwnProperty("error"))
			return undefined
		else 
			return json
	} );
}

export async function login(email, password) {
  return await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
	body: JSON.stringify({email, password})
	})
    .then(async res =>{
		const json = await res.json()
		console.log(json)
		console.log(json.hasOwnProperty("error"))
		if (json.hasOwnProperty("error"))
			return undefined
		else 
			return json
	} );
}


export async function addUser(user) {
  return await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  })
  .then(async res => {
	const json = await res.json()
	console.log(json)
	return json
	});
}

export async function updateUser(id, user) {
  return await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  })
  .then(async res => await res.json());
}

export async function deleteUser(id) {
  return await fetch(`${BASE}/${id}`, {
    method: "DELETE"
  })
  .then(async res => await res.json());
}
