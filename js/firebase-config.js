/* ═══════════════════════════════════════════════════════
   firebase-config.js — Configuration Firebase
   MathApp Space IUA
   ═══════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getStorage }   from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";

/* ── Remplace ces valeurs par celles de TON projet Firebase ── */
const firebaseConfig = {
  apiKey:            "REMPLACE_PAR_TA_CLE",
  authDomain:        "site-web-iua.firebaseapp.com",
  projectId:         "site-web-iua",
  storageBucket:     "site-web-iua.firebasestorage.app",
  messagingSenderId: "REMPLACE_PAR_TON_ID",
  appId:             "REMPLACE_PAR_TON_APP_ID"
};

/* ── Initialisation ── */
const app = initializeApp(firebaseConfig);

/* ── Services exportés ── */
export const db      = getFirestore(app);  // Base de données
export const storage = getStorage(app);    // Stockage fichiers