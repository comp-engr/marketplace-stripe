import {
  Briefcase,
  Building2,
  Car,
  Clapperboard,
  Dumbbell,
  Flower2,
  Gamepad2,
  Gift,
  Guitar,
  Hammer,
  Heart,
  House,
  Newspaper,
  Palette,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_NAMES = [
  "Vehicles",
  "Property Rentals",
  "Apparel",
  "Classifieds",
  "Electronics",
  "Entertainment",
  "Family",
  "Free Stuff",
  "Garden & Outdoor",
  "Hobbies",
  "Home Goods",
  "Home Improvement",
  "Home Sales",
  "Musical Instruments",
  "Office Supplies",
  "Pet Supplies",
  "Sporting Goods",
  "Toys & Games",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export type Category = {
  name: CategoryName;
  slug: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  { name: "Vehicles", slug: "vehicles", icon: Car },
  { name: "Property Rentals", slug: "property-rentals", icon: Building2 },
  { name: "Apparel", slug: "apparel", icon: Shirt },
  { name: "Classifieds", slug: "classifieds", icon: Newspaper },
  { name: "Electronics", slug: "electronics", icon: Smartphone },
  { name: "Entertainment", slug: "entertainment", icon: Clapperboard },
  { name: "Family", slug: "family", icon: Heart },
  { name: "Free Stuff", slug: "free-stuff", icon: Gift },
  { name: "Garden & Outdoor", slug: "garden-outdoor", icon: Flower2 },
  { name: "Hobbies", slug: "hobbies", icon: Palette },
  { name: "Home Goods", slug: "home-goods", icon: Sofa },
  { name: "Home Improvement", slug: "home-improvement", icon: Hammer },
  { name: "Home Sales", slug: "home-sales", icon: House },
  { name: "Musical Instruments", slug: "musical-instruments", icon: Guitar },
  { name: "Office Supplies", slug: "office-supplies", icon: Briefcase },
  { name: "Pet Supplies", slug: "pet-supplies", icon: PawPrint },
  { name: "Sporting Goods", slug: "sporting-goods", icon: Dumbbell },
  { name: "Toys & Games", slug: "toys-games", icon: Gamepad2 },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}

export function isCategoryName(value: string): value is CategoryName {
  return (CATEGORY_NAMES as readonly string[]).includes(value);
}
