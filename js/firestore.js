/* ═══════════════════════════════════════════════════════
   firestore.js — Opérations base de données Firestore
   MathApp Space IUA
   Gère : cours, examens, ressources, annonces
   ═══════════════════════════════════════════════════════ */

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";


/* ══════════════════════════════════════
   COURS
══════════════════════════════════════ */

/**
 * Ajouter un cours dans Firestore
 * @param {Object} cours - { titre, ue, semestre, credits, fichier }
 */
export async function ajouterCours(cours) {
  try {
    await addDoc(collection(db, 'cours'), {
      ...cours,
      createdAt: serverTimestamp()
    });
    return { succes: true };
  } catch (e) {
    console.error('Erreur ajout cours:', e);
    return { succes: false, erreur: e.message };
  }
}

/**
 * Récupérer tous les cours depuis Firestore
 * @returns {Array} liste des cours
 */
export async function getCours() {
  try {
    const q       = query(collection(db, 'cours'), orderBy('createdAt', 'desc'));
    const snap    = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Erreur lecture cours:', e);
    return [];
  }
}

/**
 * Supprimer un cours
 * @param {string} id - ID du document Firestore
 */
export async function supprimerCours(id) {
  try {
    await deleteDoc(doc(db, 'cours', id));
    return { succes: true };
  } catch (e) {
    return { succes: false, erreur: e.message };
  }
}


/* ══════════════════════════════════════
   EXAMENS
══════════════════════════════════════ */

/**
 * Ajouter un sujet d'examen
 * @param {Object} examen - { matiere, type, semestre, annee, fichier }
 */
export async function ajouterExamen(examen) {
  try {
    await addDoc(collection(db, 'examens'), {
      ...examen,
      createdAt: serverTimestamp()
    });
    return { succes: true };
  } catch (e) {
    console.error('Erreur ajout examen:', e);
    return { succes: false, erreur: e.message };
  }
}

/**
 * Récupérer tous les examens
 */
export async function getExamens() {
  try {
    const q    = query(collection(db, 'examens'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Erreur lecture examens:', e);
    return [];
  }
}

/**
 * Supprimer un examen
 */
export async function supprimerExamen(id) {
  try {
    await deleteDoc(doc(db, 'examens', id));
    return { succes: true };
  } catch (e) {
    return { succes: false, erreur: e.message };
  }
}


/* ══════════════════════════════════════
   RESSOURCES
══════════════════════════════════════ */

/**
 * Ajouter une ressource
 * @param {Object} ressource - { nom, type, url, description, tags }
 */
export async function ajouterRessource(ressource) {
  try {
    await addDoc(collection(db, 'ressources'), {
      ...ressource,
      createdAt: serverTimestamp()
    });
    return { succes: true };
  } catch (e) {
    console.error('Erreur ajout ressource:', e);
    return { succes: false, erreur: e.message };
  }
}

/**
 * Récupérer toutes les ressources
 */
export async function getRessources() {
  try {
    const q    = query(collection(db, 'ressources'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Erreur lecture ressources:', e);
    return [];
  }
}

/**
 * Supprimer une ressource
 */
export async function supprimerRessource(id) {
  try {
    await deleteDoc(doc(db, 'ressources', id));
    return { succes: true };
  } catch (e) {
    return { succes: false, erreur: e.message };
  }
}


/* ══════════════════════════════════════
   ANNONCES
══════════════════════════════════════ */

/**
 * Ajouter une annonce
 * @param {Object} annonce - { titre, message, couleur }
 */
export async function ajouterAnnonce(annonce) {
  try {
    await addDoc(collection(db, 'annonces'), {
      ...annonce,
      createdAt: serverTimestamp()
    });
    return { succes: true };
  } catch (e) {
    console.error('Erreur ajout annonce:', e);
    return { succes: false, erreur: e.message };
  }
}

/**
 * Récupérer toutes les annonces (les 5 plus récentes)
 */
export async function getAnnonces() {
  try {
    const q    = query(collection(db, 'annonces'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Erreur lecture annonces:', e);
    return [];
  }
}

/**
 * Supprimer une annonce
 */
export async function supprimerAnnonce(id) {
  try {
    await deleteDoc(doc(db, 'annonces', id));
    return { succes: true };
  } catch (e) {
    return { succes: false, erreur: e.message };
  }
}