"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";
import {
  BRAND_VOICES,
  BUSINESS_TYPES,
  MAX_SPECIAL_INSTRUCTIONS,
  OTHER_OPTION,
} from "../lib/business-profile";

type FieldErrors = {
  business_name?: string;
  business_type?: string;
  location?: string;
  brand_voice?: string;
  website?: string;
  special_instructions?: string;
};

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessTypeOther, setBusinessTypeOther] = useState("");
  const [location, setLocation] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [brandVoiceOther, setBrandVoiceOther] = useState("");
  const [website, setWebsite] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    async function loadProfile() {
      // Same pattern as app/generate/page.tsx: create the browser
      // client where it is used rather than holding it in state.
      const client = createClient();

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await client
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Business profile load error:", error);
        setFormError(
          "We could not load your existing profile. You can still fill in the form below."
        );
      }

      if (data) {
        setIsEditing(true);
        setBusinessName(data.business_name || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setSpecialInstructions(data.special_instructions || "");

        // A saved value that is not one of our presets came from the
        // "Other" field, so put it back there.
        const savedType = data.business_type || "";
        if (savedType && !BUSINESS_TYPES.includes(savedType as never)) {
          setBusinessType(OTHER_OPTION);
          setBusinessTypeOther(savedType);
        } else {
          setBusinessType(savedType);
        }

        const savedVoice = data.brand_voice || "";
        if (savedVoice && !BRAND_VOICES.includes(savedVoice as never)) {
          setBrandVoice(OTHER_OPTION);
          setBrandVoiceOther(savedVoice);
        } else {
          setBrandVoice(savedVoice);
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function resolvedBusinessType() {
    return businessType === OTHER_OPTION
      ? businessTypeOther.trim()
      : businessType.trim();
  }

  function resolvedBrandVoice() {
    return brandVoice === OTHER_OPTION
      ? brandVoiceOther.trim()
      : brandVoice.trim();
  }

  function normalizeWebsite(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!businessName.trim()) {
      next.business_name = "Business name is required.";
    } else if (businessName.trim().length < 2) {
      next.business_name = "Please enter at least 2 characters.";
    }

    const type = resolvedBusinessType();
    if (!type) {
      next.business_type =
        businessType === OTHER_OPTION
          ? "Please describe your business type."
          : "Business type is required.";
    }

    if (!location.trim()) {
      next.location = "Location is required.";
    }

    const voice = resolvedBrandVoice();
    if (!voice) {
      next.brand_voice =
        brandVoice === OTHER_OPTION
          ? "Please describe your brand voice."
          : "Brand voice is required.";
    }

    if (website.trim()) {
      try {
        const url = new URL(normalizeWebsite(website));
        if (!url.hostname.includes(".")) {
          next.website = "Please enter a valid website address.";
        }
      } catch {
        next.website = "Please enter a valid website address.";
      }
    }

    if (specialInstructions.length > MAX_SPECIAL_INSTRUCTIONS) {
      next.special_instructions = `Please keep this under ${MAX_SPECIAL_INSTRUCTIONS} characters.`;
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (saving) return;

    setFormError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { error } = await supabase
        .from("business_profiles")
        .upsert(
          {
            user_id: user.id,
            business_name: businessName.trim(),
            business_type: resolvedBusinessType(),
            location: location.trim(),
            brand_voice: resolvedBrandVoice(),
            website: normalizeWebsite(website) || null,
            special_instructions: specialInstructions.trim() || null,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Business profile save error:", error);
        setFormError(
          `We could not save your profile: ${error.message}`
        );
        setSaving(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("ONBOARDING ERROR:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

  const errorInputClass =
    "w-full rounded-xl border border-red-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">

        {isEditing && (
          <a
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Dashboard
          </a>
        )}

        <div className={isEditing ? "mt-8" : ""}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {isEditing ? "Edit your business" : "Set up your business"}
          </h1>

          <p className="mt-3 leading-7 text-gray-600">
            Tell ReviewPilot about your business so every AI response
            sounds like it was written specifically for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >

          {/* Business name */}
          <div>
            <label
              htmlFor="business_name"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Business name
            </label>

            <input
              id="business_name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Bella Pizza"
              maxLength={120}
              className={errors.business_name ? errorInputClass : inputClass}
            />

            {errors.business_name && (
              <p className="mt-2 text-sm text-red-600">
                {errors.business_name}
              </p>
            )}
          </div>

          {/* Business type */}
          <div className="mt-6">
            <label
              htmlFor="business_type"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Business type
            </label>

            <select
              id="business_type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={`${
                errors.business_type ? errorInputClass : inputClass
              } bg-white`}
            >
              <option value="">Select a business type</option>

              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}

              <option value={OTHER_OPTION}>Other</option>
            </select>

            {businessType === OTHER_OPTION && (
              <input
                type="text"
                value={businessTypeOther}
                onChange={(e) => setBusinessTypeOther(e.target.value)}
                placeholder="Describe your business type"
                maxLength={80}
                className={`mt-3 ${
                  errors.business_type ? errorInputClass : inputClass
                }`}
              />
            )}

            {errors.business_type && (
              <p className="mt-2 text-sm text-red-600">
                {errors.business_type}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="mt-6">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lahore, Pakistan"
              maxLength={120}
              className={errors.location ? errorInputClass : inputClass}
            />

            {errors.location ? (
              <p className="mt-2 text-sm text-red-600">{errors.location}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                City and country is enough. It helps replies sound local.
              </p>
            )}
          </div>

          {/* Brand voice */}
          <div className="mt-6">
            <label
              htmlFor="brand_voice"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Brand voice
            </label>

            <select
              id="brand_voice"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className={`${
                errors.brand_voice ? errorInputClass : inputClass
              } bg-white`}
            >
              <option value="">Select a brand voice</option>

              {BRAND_VOICES.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}

              <option value={OTHER_OPTION}>Other</option>
            </select>

            {brandVoice === OTHER_OPTION && (
              <input
                type="text"
                value={brandVoiceOther}
                onChange={(e) => setBrandVoiceOther(e.target.value)}
                placeholder="Describe how your business should sound"
                maxLength={120}
                className={`mt-3 ${
                  errors.brand_voice ? errorInputClass : inputClass
                }`}
              />
            )}

            {errors.brand_voice ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.brand_voice}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                This sets the overall personality. The tone you pick on each
                reply still applies on top of it.
              </p>
            )}
          </div>

          {/* Website */}
          <div className="mt-6">
            <label
              htmlFor="website"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Website
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <input
              id="website"
              type="text"
              inputMode="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="bellapizza.com"
              maxLength={200}
              className={errors.website ? errorInputClass : inputClass}
            />

            {errors.website && (
              <p className="mt-2 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          {/* Special instructions */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="special_instructions"
                className="text-sm font-semibold text-gray-800"
              >
                Special instructions
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <span
                className={`text-xs ${
                  specialInstructions.length > MAX_SPECIAL_INSTRUCTIONS
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {specialInstructions.length}/{MAX_SPECIAL_INSTRUCTIONS}
              </span>
            </div>

            <textarea
              id="special_instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Keep responses concise and never use emojis. Always invite unhappy customers to email us directly."
              rows={4}
              className={`resize-none ${
                errors.special_instructions ? errorInputClass : inputClass
              }`}
            />

            {errors.special_instructions ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.special_instructions}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Rules the AI should always follow when replying as your
                business.
              </p>
            )}
          </div>

          {formError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-gray-900 px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>

          {!isEditing && (
            <p className="mt-4 text-center text-xs text-gray-500">
              You can change any of this later from your dashboard.
            </p>
          )}

        </form>

      </div>
    </main>
  );
}
