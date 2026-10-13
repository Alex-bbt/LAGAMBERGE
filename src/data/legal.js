// Contrôle des mentions légales : liste des champs obligatoires manquants.
// En production (VERCEL_ENV=production), le build échoue s'il en manque un :
// le site ne peut pas être publié avec des mentions incomplètes ou provisoires.
import { editeur } from './mediakit.js';

const OBLIGATOIRES = {
  statut: 'statut de l’éditeur',
  adresse: 'adresse',
  telephone: 'téléphone',
  siren: 'SIREN',
  registre: 'registre d’immatriculation',
  directeurPublication: 'directeur de la publication',
  messagerie: 'fournisseur de la messagerie contact@',
};

export const champsManquants = () =>
  Object.entries(OBLIGATOIRES).filter(([cle]) => !editeur[cle]).map(([, libelle]) => libelle);

export function verifierMentions() {
  const manquants = champsManquants();
  if (manquants.length === 0) return;
  const message = `Mentions légales incomplètes : ${manquants.join(', ')} (src/data/mediakit.js, editeur).`;
  if (process.env.VERCEL_ENV === 'production') throw new Error(message);
  console.warn(`[mentions] ${message}`);
}
