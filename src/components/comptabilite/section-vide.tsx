const SECTIONS = {
  "tableau-de-bord": {
    titre: "Tableau de bord",
    texte: "Les indicateurs financiers apparaîtront ici : recettes, dépenses, créances et soldes.",
  },
  factures: {
    titre: "Factures",
    texte: "La liste des factures, leurs statuts et le reste à payer seront gérés dans cet espace.",
  },
  paiements: {
    titre: "Paiements",
    texte: "Les encaissements liés aux factures seront enregistrés ici.",
  },
  depenses: {
    titre: "Dépenses",
    texte: "Les dépenses, leur validation et leurs justificatifs seront suivis ici.",
  },
  caisse: {
    titre: "Trésorerie",
    texte: "Les comptes de trésorerie, leurs entrées, sorties et soldes seront consultés ici.",
  },
  banque: {
    titre: "Banque",
    texte: "Les comptes bancaires et leurs mouvements seront consultés ici.",
  },
  clients: {
    titre: "Clients",
    texte: "Le résumé financier de chaque client — facturé, payé, reste dû — sera affiché ici.",
  },
  fournisseurs: {
    titre: "Fournisseurs",
    texte: "Les dettes et paiements fournisseurs seront suivis ici.",
  },
  rapports: {
    titre: "Rapports",
    texte: "Les rapports de recettes, dépenses, trésorerie et banque seront exportés depuis ici.",
  },
} as const;

export type SectionComptabilite = keyof typeof SECTIONS;

export function SectionComptabilite({ section }: { section: SectionComptabilite }) {
  const { titre, texte } = SECTIONS[section];
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
        Comptabilité
      </p>
      <h1 className="mt-2 font-display text-3xl">{titre}</h1>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-display text-xl">{titre}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{texte}</p>
      </div>
    </div>
  );
}
