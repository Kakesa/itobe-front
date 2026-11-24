/**
 * Commandes de démonstration.
 * Aucun import : lu par les seeds admin sans attendre le graphe du routeur.
 */
export type Commande = {
  id: string;
  client: string;
  livre: string;
  moyen: "Mobile Money" | "Carte bancaire";
  montant: number;
  statut: "Payée" | "En attente" | "Échouée" | "Remboursée";
  date: string;
};

export const commandes: Commande[] = [
  { id: "#10428", client: "Nadia Kabeya", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-28" },
  { id: "#10427", client: "Serge Ilunga", livre: "Grammaire du courage", moyen: "Carte bancaire", montant: 12, statut: "Payée", date: "2026-07-27" },
  { id: "#10426", client: "Aline Mputu", livre: "Histoire des presses africaines", moyen: "Mobile Money", montant: 21, statut: "En attente", date: "2026-07-27" },
  { id: "#10425", client: "Joël Tshibangu", livre: "Nuit blanche à Matonge", moyen: "Mobile Money", montant: 9, statut: "Payée", date: "2026-07-26" },
  { id: "#10424", client: "Grace Lumbu", livre: "Poèmes du quatrième jour", moyen: "Carte bancaire", montant: 8, statut: "Remboursée", date: "2026-07-25" },
  { id: "#10423", client: "Patrick Nzuzi", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-24" },
  { id: "#10422", client: "Ruth Kalala", livre: "Le cartable de Kimia", moyen: "Carte bancaire", montant: 7, statut: "Échouée", date: "2026-07-23" },
  { id: "#10421", client: "David Mukendi", livre: "Grammaire du courage", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-22" },
];
