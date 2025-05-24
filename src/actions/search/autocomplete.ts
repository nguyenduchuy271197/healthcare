"use server";

import { createClient } from "@/lib/supabase/server";

type SearchType = "doctors" | "specializations" | "conditions" | "medications";

interface AutocompleteResult {
  id: string;
  label: string;
  type: SearchType;
  metadata?: Record<string, unknown>;
}

interface AutocompleteSearchResult {
  success: boolean;
  error?: string;
  data?: AutocompleteResult[];
}

export async function autocompleteSearch(
  query: string,
  type: SearchType
): Promise<AutocompleteSearchResult> {
  try {
    const supabase = createClient();

    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
      };
    }

    const searchQuery = `%${query.toLowerCase()}%`;
    const results: AutocompleteResult[] = [];

    switch (type) {
      case "doctors":
        const { data: doctors } = await supabase
          .from("doctors")
          .select(`
            id,
            specialization,
            user_profiles (
              full_name
            )
          `)
          .ilike("user_profiles.full_name", searchQuery)
          .limit(10);

        if (doctors) {
          doctors.forEach(doctor => {
            const profile = doctor.user_profiles as { full_name: string };
            results.push({
              id: doctor.id,
              label: profile.full_name,
              type: "doctors",
              metadata: {
                specialization: doctor.specialization,
              },
            });
          });
        }
        break;

      case "specializations":
        const { data: specializations } = await supabase
          .from("doctors")
          .select("specialization")
          .ilike("specialization", searchQuery)
          .not("specialization", "is", null)
          .limit(10);

        if (specializations) {
          const uniqueSpecializations = Array.from(
            new Set(specializations.map(s => s.specialization).filter(Boolean))
          );

          uniqueSpecializations.forEach(spec => {
            results.push({
              id: spec!,
              label: spec!,
              type: "specializations",
            });
          });
        }
        break;

      case "conditions":
        // Search in medical records for common conditions/diagnoses
        const { data: conditions } = await supabase
          .from("medical_records")
          .select("diagnosis")
          .ilike("diagnosis", searchQuery)
          .not("diagnosis", "is", null)
          .limit(10);

        if (conditions) {
          const uniqueConditions = Array.from(
            new Set(conditions.map(c => c.diagnosis).filter(Boolean))
          );

          uniqueConditions.forEach(condition => {
            results.push({
              id: condition!,
              label: condition!,
              type: "conditions",
            });
          });
        }
        break;

      case "medications":
        // Search in prescription_items for common medications
        const { data: medicationItems } = await supabase
          .from("prescription_items")
          .select("medication_name")
          .ilike("medication_name", searchQuery)
          .not("medication_name", "is", null)
          .limit(10);

        if (medicationItems) {
          const uniqueMedications = Array.from(
            new Set(medicationItems.map(item => item.medication_name).filter(Boolean))
          );

          uniqueMedications.forEach(medication => {
            results.push({
              id: medication!,
              label: medication!,
              type: "medications",
            });
          });
        }
        break;

      default:
        return {
          success: false,
          error: "Invalid search type",
        };
    }

    return {
      success: true,
      data: results.slice(0, 10), // Limit to 10 results
    };
  } catch (error) {
    console.error("Autocomplete search error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during autocomplete search",
    };
  }
} 