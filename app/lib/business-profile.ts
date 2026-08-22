// Shared shape and option lists for the business profile.
// Kept in one place so /onboarding and /dashboard never drift apart.

export type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  location: string;
  brand_voice: string;
  special_instructions: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export const BUSINESS_TYPES = [
  "Restaurant",
  "Cafe",
  "Hotel",
  "Salon or Spa",
  "Retail Store",
  "Gym or Fitness Studio",
  "Dental or Medical Clinic",
  "Auto Repair",
  "Real Estate",
  "Home Services",
  "Professional Services",
  "E-commerce",
] as const;

export const BRAND_VOICES = [
  "Friendly and professional",
  "Warm and personal",
  "Formal and polished",
  "Casual and conversational",
  "Concise and direct",
  "Enthusiastic and upbeat",
] as const;

export const OTHER_OPTION = "__other__";

export const MAX_SPECIAL_INSTRUCTIONS = 500;
