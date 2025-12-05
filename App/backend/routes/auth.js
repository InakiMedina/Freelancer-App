// routes/auth.js
import fs from "fs";
import path from "path";

import jwt from 'jsonwebtoken'
import * as usersService from "../services/users.service.js"

import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const secretsPath = path.join(__dirname, "..", "data", "private.txt");

const saltRounds = 10
const tokenExpirationSeconds = (60 * 60)

export const tokenVerify =  (req, res, next) => {
	const token = req.cookies.access_token

	const privateKey = fs.readFileSync(secretsPath, "utf8")

	try {
		const data = jwt.verify(token, privateKey)
	} catch(err) {
		return res.redirect('/auth');
	}

	next()
}

export const login = async (req, res) => {
	const data = req.body
  	// sign with RSA SHA256
	var privateKey = fs.readFileSync(secretsPath, "utf8")

	const user = usersService.getUserByEmail(data.email)
	if (!user)
		return {
		success: 404,
		body: 
			{ description: "Email not found" }
		}

	// verify password
	let match = true
	bcrypt.compare(data.password, user.hashPassword, 
		function(error, result) {
			match = result
		}
	)

	if (!match)
		return {
		success: 404,
		body: 
			{ description: "Password incorrect" }
		};

	const token = jwt.sign(
	{ 
		exp: Math.floor(Date.now() / 1000) + tokenExpirationSeconds,
		user
	}, 
	privateKey, 
	{ 
	  	algorithm: 'RS256' 
	})

	res.cookie('access_token', token, {
		httpOnly: 'true',
		secure: process.env.NODE_ENV === 'production',
		sameSite: "lax",
		maxAge: tokenExpirationSeconds * 1000
	}).send(user)
}

export const signup = async (req, res) => {
	let data = req.body


    var privateKey = fs.readFileSync(secretsPath, "utf8");
	data.hashedPassword = await bcrypt.hash(data.password, saltRounds)
	delete data["password"]

	console.log(data)
	const response = usersService.createUser(data)
	console.log(response)

	if (response.success >= 400)
		return response

	const body = {"email": data.email, "name": data.name}
	
  	const token = jwt.sign(
	{ 
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		body
	}, 
	privateKey, 
	{ 
	  	algorithm: 'RS256' 
	})

	res.cookie('access_token', token, {
		httpOnly: 'true',
		secure: process.env.NODE_ENV === 'production',
		sameSite: "lax",
		maxAge: tokenExpirationSeconds * 1000
	})
}