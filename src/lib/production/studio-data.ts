import type { ProductionCopy, ProjectSlug } from "@/lib/production/copy";

export type { ProjectSlug };

export type Project = {
  slug: ProjectSlug;
  number: string;
  title: string;
  type: string;
  year: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  alt: string;
  logline: string;
  synopsis: string;
  director: string;
  producers: string;
  cast: string;
  location: string;
};

export const projects: Project[] = [
  {
    slug: "where-the-earth-remembers",
    number: "01",
    title: "Where the Earth Remembers",
    type: "Feature Film",
    year: "2026",
    image: "/images/production/hero-volcanic-dawn.jpg",
    imageWidth: 1920,
    imageHeight: 1088,
    alt: "A woman in an ivory dress crossing a volcanic landscape at dawn",
    logline: "A return to the land becomes a reckoning with memory.",
    synopsis:
      "After fifteen years abroad, Amara returns to the volcanic highlands where she was born. What begins as a final visit to her family home becomes an intimate search through silence, inheritance and the stories a landscape refuses to forget.",
    director: "Nadia Kalume",
    producers: "Maya Itobe, Alain Bisimwa",
    cast: "Zawadi Mbuyi, Sarah Kazadi, Jean Kanku",
    location: "Goma · Brussels",
  },
  {
    slug: "the-river-between-us",
    number: "02",
    title: "The River Between Us",
    type: "Limited Series",
    year: "2025",
    image: "/images/production/work-river-silence.jpg",
    imageWidth: 1600,
    imageHeight: 1104,
    alt: "A lone canoe crossing a vast river at blue hour",
    logline: "Three generations. One river. A truth carried downstream.",
    synopsis:
      "Across six chapters, a family divided between Kinshasa and Kisangani follows the path of a missing letter. Their journey along the Congo River reveals the private history that shaped them—and the choice that could bring them home.",
    director: "Joël Makengo",
    producers: "Maya Itobe, Elise Mbala",
    cast: "Dena Mwana, Christian Lukusa, Grâce Bijoux",
    location: "Kinshasa · Kisangani",
  },
  {
    slug: "hands-of-memory",
    number: "03",
    title: "Hands of Memory",
    type: "Documentary",
    year: "2025",
    image: "/images/production/work-hands-memory.jpg",
    imageWidth: 1408,
    imageHeight: 1808,
    alt: "An elderly artisan holding a hand-carved object in his workshop",
    logline: "The gestures we inherit become the stories we preserve.",
    synopsis:
      "In workshops, courtyards and village paths, master artisans pass on knowledge that has never been written down. Hands of Memory is a quiet portrait of six makers and the living archives carried in their gestures.",
    director: "Aline Tshibanda",
    producers: "Itobe Production, Kivu Arts Fund",
    cast: "Featuring master artisans across Central Africa",
    location: "DR Congo · Rwanda · Cameroon",
  },
  {
    slug: "beyond-the-horizon",
    number: "04",
    title: "Beyond the Horizon",
    type: "Short Film",
    year: "2024",
    image: "/images/production/work-beyond-horizon.jpg",
    imageWidth: 1600,
    imageHeight: 1104,
    alt: "Two children walking through tall grass toward a city at sunset",
    logline: "Two siblings walk toward a city they have only seen in dreams.",
    synopsis:
      "At the edge of a changing city, Ayo and Nia make a promise to see the lights before nightfall. Their small expedition becomes a luminous story of kinship, imagination and the futures children build for themselves.",
    director: "David Ilunga",
    producers: "Maya Itobe, Pierre Lufungula",
    cast: "Merveille Mpoyi, Noé Mutombo",
    location: "Lubumbashi",
  },
];

export const studio = {
  email: "contact@itobeproduction.com",
  phone: "+243 858 726 825",
  address: "Kinshasa, Democratic Republic of the Congo",
};

export function localizeProject(project: Project, t: ProductionCopy): Project {
  const copy = t.projects[project.slug];
  return { ...project, ...copy };
}
