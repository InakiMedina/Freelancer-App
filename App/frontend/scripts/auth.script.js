import * as authApi from '../api/auth.api.js'

// Current User
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Navigation
const navLogin = document.getElementById('nav-login');
const navRegister = document.getElementById('nav-register');


// Auth Elements
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authAlert = document.getElementById('auth-alert');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchLink = document.getElementById('auth-switch-link');
const nameGroup = document.getElementById('name-group');
const userTypeGroup = document.getElementById('user-type-group');
const cvGroup = document.getElementById('cv-group');

const UserTypes = {
	FREELANCER: 'freelancer',
	CLIENT: 'client'
};

function setupEventListeners() {
	// Auth
	authForm.addEventListener('submit', handleAuth);
	authSwitchLink.addEventListener('click', toggleAuthMode);
}



function showAlert(message, element, type) {
	element.textContent = message;
	element.className = `alert alert-${type}`;
	element.classList.remove('hidden');
	
	// Auto-hide after 5 seconds
	setTimeout(() => {
		console.log(element)
		hideAlert(element);
	}, 5000);
}

function hideAlert(element) {
	element.classList.add('hidden');
}

// Auth Functions
function setAuthMode(mode) {
	if (mode === 'login') {
		authTitle.textContent = 'Iniciar Sesión';
		authSubmitBtn.textContent = 'Iniciar Sesión';
		authSwitchText.innerHTML = '¿No tienes una cuenta? <a href="#" id="auth-switch-link">Regístrate</a>';
		nameGroup.style.display = 'none';
		userTypeGroup.style.display = 'none';
		cvGroup.style.display = 'none';
	} else {
		authTitle.textContent = 'Registrarse';
		authSubmitBtn.textContent = 'Registrarse';
		authSwitchText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="auth-switch-link">Inicia Sesión</a>';
		nameGroup.style.display = 'block';
		userTypeGroup.style.display = 'block';
		
		// Re-attach event listener after updating the DOM
		document.getElementById('auth-switch-link').addEventListener('click', toggleAuthMode);
		
		// Show CV field only for freelancers
		document.getElementById('user-type').addEventListener('change', (e) => {
			cvGroup.style.display = e.target.value === UserTypes.FREELANCER ? 'block' : 'none';
		});
	}
	
	// Clear form and alert
	authForm.reset();
	hideAlert(authAlert);
}

function toggleAuthMode(e) {
	e.preventDefault();
	const isLogin = authTitle.textContent === 'Iniciar Sesión';
	setAuthMode(isLogin ? 'register' : 'login');
}

async function handleAuth(e) {
	e.preventDefault();
	
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	
	if (authTitle.textContent === 'Iniciar Sesión') {
		// Login
		const user = await authApi.login(email, password)
		console.log(user)
		
		if (user) {
			currentUser = user;
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
			window.location.replace('/')
		} else {
			showAlert('Credenciales incorrectas. Inténtalo de nuevo.', authAlert, 'danger');
		}
	} else {
		// Register
		const name = document.getElementById('name').value;
		const userType = document.getElementById('user-type').value;
		const cvFile = document.getElementById('cv').files[0];
		
		
		// Create new user
		const newUser = {
			name,
			email,
			password,
			type: userType,
			registrationDate: new Date().toISOString(),
			rating: 0,
			raitingCount: 0,
			educationLevel: '',
			occupation: '',
			currentWork: '',
			cv: cvFile ? cvFile.name : '',
			projects: []
		};
	
		currentUser = newUser;
		console.log("here0")
		const signupRes = await authApi.signup(newUser)
		if (!signupRes) {
			e.stopImmediatePropagation()
			showAlert("Failed to authenticate", authAlert, 'danger');
			return
		}
		localStorage.setItem('currentUser', JSON.stringify(currentUser));
		
		updateNavigation();
		showDashboard();
	}
}


setupEventListeners();