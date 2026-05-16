/* ═══════════════════════════════════════════════════════
   auth.js — MathApp Space IUA
   Gestion de la connexion et de la création de compte
   Stockage : localStorage (prototype – pas de serveur)
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────
   CONSTANTES
────────────────────────────────────── */

// Clé de stockage des utilisateurs dans localStorage
const USERS_KEY = 'mathapp_users';

// Clé pour la session active
const SESSION_KEY = 'mathapp_session';

// Regex de validation du matricule
// Format : 2 chiffres + "MA" + 1 ou plusieurs chiffres + 1 lettre finale
// Exemples valides : 25MA1042A  |  26MA0312F  |  23MA200Z
const MATRICULE_REGEX = /^\d{2}MA\d+[A-Za-z]$/;

// Années considérées comme "Administrateur" (ex-L1 devenus L2)
const ADMIN_YEARS = ['23', '24', '25'];


/* ──────────────────────────────────────
   UTILITAIRES : STOCKAGE
────────────────────────────────────── */

/**
 * Récupère tous les utilisateurs enregistrés.
 * @returns {Object} dictionnaire { matricule: { nom, passwordHash, role } }
 */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Sauvegarde les utilisateurs.
 * @param {Object} users
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Enregistre la session active (utilisateur connecté).
 * @param {Object} user - { matricule, nom, role }
 */
function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Récupère la session active, ou null si personne n'est connecté.
 * @returns {Object|null}
 */
function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

/**
 * Déconnecte l'utilisateur (supprime la session).
 */
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}


/* ──────────────────────────────────────
   UTILITAIRES : VALIDATION
────────────────────────────────────── */

/**
 * Vérifie si un matricule respecte le format attendu.
 * @param {string} matricule
 * @returns {boolean}
 */
function isValidMatricule(matricule) {
  return MATRICULE_REGEX.test(matricule.trim());
}

/**
 * Détermine le rôle à partir des 2 premiers chiffres du matricule.
 * @param {string} matricule
 * @returns {'admin'|'etudiant'|null}
 */
function getRoleFromMatricule(matricule) {
  if (!isValidMatricule(matricule)) return null;
  const year = matricule.trim().substring(0, 2);
  const yearNum = parseInt(year, 10);

  if (ADMIN_YEARS.includes(year)) {
    return 'admin';
  }
  // Étudiant si l'année est 26 ou plus
  if (yearNum >= 26) {
    return 'etudiant';
  }
  return null; // Matricule incohérent (ex : 10, 99…)
}

/**
 * Hachage simple du mot de passe (pour un prototype sans serveur).
 * NE PAS utiliser en production réelle — utiliser bcrypt côté serveur.
 * @param {string} password
 * @returns {string}
 */
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}


/* ──────────────────────────────────────
   UTILITAIRES : INTERFACE
────────────────────────────────────── */

/**
 * Affiche un message d'erreur sous un champ.
 * @param {string} fieldId - id de la span d'erreur (ex: "err-reg-nom")
 * @param {string} message
 */
function showFieldError(fieldId, message) {
  const el = document.getElementById(fieldId);
  if (el) el.textContent = message;
}

/**
 * Efface tous les messages d'erreur de champs dans un formulaire.
 * @param {string[]} fieldIds
 */
function clearFieldErrors(fieldIds) {
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/**
 * Affiche ou cache une alerte globale de formulaire.
 * @param {string} alertId
 * @param {string} message - vide pour cacher
 */
function showAlert(alertId, message) {
  const el = document.getElementById(alertId);
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.classList.add('show');
  } else {
    el.textContent = '';
    el.classList.remove('show');
  }
}

/**
 * Marque un input comme valide ou en erreur visuellement.
 * @param {string} inputId
 * @param {boolean} valid
 */
function setInputState(inputId, valid) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.classList.toggle('is-valid', valid);
  el.classList.toggle('is-error', !valid);
}

/**
 * Affiche / masque le mot de passe dans un champ.
 * @param {string} inputId
 * @param {HTMLElement} btn
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}


/* ──────────────────────────────────────
   ONGLETS
────────────────────────────────────── */

/**
 * Bascule entre les onglets "Se connecter" et "Créer un compte".
 * @param {'login'|'register'} tab
 */
function switchTab(tab) {
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin   = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.classList.remove('active');
    tabRegister.setAttribute('aria-selected', 'false');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabRegister.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'false');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }

  // Réinitialiser les alertes au changement d'onglet
  showAlert('alert-login', '');
  showAlert('alert-register-error', '');
  showAlert('alert-register-ok', '');
}


/* ──────────────────────────────────────
   DÉTECTION DU RÔLE EN TEMPS RÉEL
────────────────────────────────────── */

// S'exécute au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {

  // ── Uniquement sur la page de connexion (index.html) ──
  // On détecte qu'on est sur la page de login par la présence du formulaire
  const isLoginPage = !!document.getElementById('form-login');

  if (isLoginPage) {
    // Si une session existe déjà → rediriger directement
    const session = getSession();
    if (session) {
      redirectAfterLogin(session.role);
      return;
    }
  }

  // Détection rôle temps réel (uniquement sur la page d'inscription)
  const regMatricule = document.getElementById('reg-matricule');
  if (regMatricule) {
    regMatricule.addEventListener('input', () => {
      const val = regMatricule.value.trim();
      const badge = document.getElementById('role-detected');
      if (!badge) return;

      if (!val) {
        badge.textContent = '';
        badge.className = 'role-detected';
        return;
      }

      if (!isValidMatricule(val)) {
        badge.textContent = '⚠ Format invalide';
        badge.className = 'role-detected';
        badge.style.background = 'rgba(220,38,38,.08)';
        badge.style.color = '#DC2626';
        return;
      }

      const role = getRoleFromMatricule(val);
      badge.style.background = '';
      badge.style.color = '';

      if (role === 'admin') {
        badge.textContent = '🛡 Rôle détecté : Administrateur (L2)';
        badge.className = 'role-detected admin';
      } else if (role === 'etudiant') {
        badge.textContent = '🎒 Rôle détecté : Étudiant (L1)';
        badge.className = 'role-detected etudiant';
      } else {
        badge.textContent = '⚠ Année de matricule non reconnue';
        badge.className = 'role-detected';
        badge.style.background = 'rgba(220,38,38,.08)';
        badge.style.color = '#DC2626';
      }
    });
  }

});


/* ──────────────────────────────────────
   CONNEXION
────────────────────────────────────── */

/**
 * Gère la soumission du formulaire de connexion.
 * @param {Event} event
 */
function handleLogin(event) {
  event.preventDefault();

  // Récupérer les valeurs
  const matricule = document.getElementById('login-matricule').value.trim().toUpperCase();
  const password  = document.getElementById('login-password').value;

  // Réinitialiser
  clearFieldErrors(['err-login-matricule', 'err-login-password']);
  showAlert('alert-login', '');

  // ── Validation ──
  let valid = true;

  if (!matricule) {
    showFieldError('err-login-matricule', 'Veuillez entrer votre matricule.');
    setInputState('login-matricule', false);
    valid = false;
  } else if (!isValidMatricule(matricule)) {
    showFieldError('err-login-matricule', 'Format invalide. Ex : 26MA0312F');
    setInputState('login-matricule', false);
    valid = false;
  }

  if (!password) {
    showFieldError('err-login-password', 'Veuillez entrer votre mot de passe.');
    setInputState('login-password', false);
    valid = false;
  }

  if (!valid) return;

  // ── Vérification dans la base ──
  const users = getUsers();
  const user  = users[matricule];

  if (!user) {
    showAlert('alert-login', '❌ Aucun compte trouvé avec ce matricule. Veuillez créer un compte d\'abord.');
    setInputState('login-matricule', false);
    return;
  }

  if (user.passwordHash !== simpleHash(password)) {
    showAlert('alert-login', '❌ Mot de passe incorrect. Veuillez réessayer.');
    setInputState('login-password', false);
    return;
  }

  // ── Connexion réussie ──
  const session = {
    matricule: matricule,
    nom:       user.nom,
    role:      user.role,
  };
  saveSession(session);

  // Désactiver le bouton pendant la redirection
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = '✅ Connexion réussie… redirection';

  // Redirection selon le rôle
  setTimeout(() => redirectAfterLogin(user.role), 900);
}


/* ──────────────────────────────────────
   CRÉATION DE COMPTE
────────────────────────────────────── */

/**
 * Gère la soumission du formulaire de création de compte.
 * @param {Event} event
 */
function handleRegister(event) {
  event.preventDefault();

  // Récupérer les valeurs
  const nom       = document.getElementById('reg-nom').value.trim();
  const matricule = document.getElementById('reg-matricule').value.trim().toUpperCase();
  const password  = document.getElementById('reg-password').value;
  const confirm   = document.getElementById('reg-confirm').value;

  // Réinitialiser
  clearFieldErrors(['err-reg-nom', 'err-reg-matricule', 'err-reg-password', 'err-reg-confirm']);
  showAlert('alert-register-error', '');
  showAlert('alert-register-ok', '');

  // ── Validations ──
  let valid = true;

  // Nom
  if (!nom) {
    showFieldError('err-reg-nom', 'Veuillez entrer votre nom complet.');
    setInputState('reg-nom', false);
    valid = false;
  } else if (nom.length < 3) {
    showFieldError('err-reg-nom', 'Le nom doit contenir au moins 3 caractères.');
    setInputState('reg-nom', false);
    valid = false;
  }

  // Matricule : format
  if (!matricule) {
    showFieldError('err-reg-matricule', 'Veuillez entrer votre matricule.');
    setInputState('reg-matricule', false);
    valid = false;
  } else if (!isValidMatricule(matricule)) {
    showFieldError('err-reg-matricule', 'Format invalide. Ex : 26MA0312F');
    setInputState('reg-matricule', false);
    valid = false;
  } else {
    // Matricule : rôle reconnu
    const role = getRoleFromMatricule(matricule);
    if (!role) {
      showFieldError('err-reg-matricule', 'Année de matricule non reconnue (attendu : 23–26+).');
      setInputState('reg-matricule', false);
      valid = false;
    } else {
      // Matricule : unicité (un matricule = un seul compte)
      const users = getUsers();
      if (users[matricule]) {
        showFieldError('err-reg-matricule', 'Un compte existe déjà avec ce matricule.');
        setInputState('reg-matricule', false);
        valid = false;
      }
    }
  }

  // Mot de passe
  if (!password) {
    showFieldError('err-reg-password', 'Veuillez choisir un mot de passe.');
    setInputState('reg-password', false);
    valid = false;
  } else if (password.length < 6) {
    showFieldError('err-reg-password', 'Le mot de passe doit contenir au moins 6 caractères.');
    setInputState('reg-password', false);
    valid = false;
  }

  // Confirmation
  if (!confirm) {
    showFieldError('err-reg-confirm', 'Veuillez confirmer votre mot de passe.');
    setInputState('reg-confirm', false);
    valid = false;
  } else if (password && confirm !== password) {
    showFieldError('err-reg-confirm', 'Les mots de passe ne correspondent pas.');
    setInputState('reg-confirm', false);
    valid = false;
  }

  if (!valid) return;

  // ── Enregistrement ──
  const role  = getRoleFromMatricule(matricule);
  const users = getUsers();

  users[matricule] = {
    nom:          nom,
    role:         role,
    passwordHash: simpleHash(password),
    createdAt:    new Date().toISOString(),
  };

  saveUsers(users);

  // Message de succès
  showAlert('alert-register-ok',
    `✅ Compte créé avec succès ! Bienvenue, ${nom.split(' ')[0]}. Tu peux maintenant te connecter.`
  );

  // Réinitialiser le formulaire
  document.getElementById('form-register').reset();
  document.getElementById('role-detected').textContent = '';

  // Basculer vers l'onglet connexion après 2 secondes
  setTimeout(() => {
    switchTab('login');
    // Pré-remplir le matricule dans le formulaire de connexion
    const loginMatInput = document.getElementById('login-matricule');
    if (loginMatInput) loginMatInput.value = matricule;
  }, 2000);
}


/* ──────────────────────────────────────
   REDIRECTION APRÈS CONNEXION
────────────────────────────────────── */

/**
 * Redirige vers la bonne page selon le rôle.
 * @param {'admin'|'etudiant'} role
 */
function redirectAfterLogin(role) {
  if (role === 'admin') {
    window.location.href = 'pages/dashboard_admin.html';
  } else {
    window.location.href = 'pages/accueil.html';
  }
}