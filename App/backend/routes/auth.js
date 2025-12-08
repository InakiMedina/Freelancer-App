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

	//check if data matches existing user
	const emailMatch = await usersService.getUserByEmail(data.email)
	if (emailMatch) {
		return res.status(409).json("You already have an account with this email")
	}

	const nameMatch = await usersService.getUserByName(data.name)
	if (nameMatch) {
		return res.status(409).json("This username has already been taken")
	}

	console.log(data)
	const response = usersService.createUser(data)
	console.log(response)

	if (response.success >= 400)
		return res.status(response.success).send(response)

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

	res.status(200).json(response.body);
}

export const logout = async (req, res) => {
	// 1. Clear the cookie by setting its expiration date to a time in the past
    res.cookie('access_token', '', { 
        expires: new Date(0), // Sets expiration to Unix Epoch (Jan 1, 1970)
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        path: '/', // Ensure the path matches the original cookie path
    });

    // 2. Respond to the client
    res.status(200).json({ message: 'Logged in successfully' });
}