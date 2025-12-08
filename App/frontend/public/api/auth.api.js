

export async function login(email, password) {
  return await fetch(`http://localhost:3000/login`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({email, password})
	})
	.then(async res =>{
		const json = await res.json()
		if (json.hasOwnProperty("error"))
			return undefined
		else 
			return json
	} );
}


export async function signup(user) {
  return await fetch(`http://localhost:3000/signup`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(user)
  })
  .then(async res => {
	console.log(res)
	return {"ok": res.ok,"body": await res.json()}
  })
}

export async function logout() {
  return await fetch(`http://localhost:3000/logout`, {
	method: "POST",
  })
  .then(async res =>
	res
  )
}