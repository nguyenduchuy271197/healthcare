"use server";

import { createClient } from "@/lib/supabase/server";
import { Doctor } from "@/types/custom.types";

interface DoctorSearchFilters {
  specialization?: string;
  location?: string;
  minRating?: number;
  isAvailable?: boolean;
  minExperience?: number;
  maxFee?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

interface SearchDoctorsResult {
  success: boolean;
  error?: string;
  data?: (Doctor & {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
    };
  })[];
  total?: number;
}

export async function searchDoctors(filters: DoctorSearchFilters = {}): Promise<SearchDoctorsResult> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("doctors")
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `, { count: "exact" });

    // Apply filters
    if (filters.specialization) {
      query = query.ilike("specialization", `%${filters.specialization}%`);
    }

    if (filters.location) {
      query = query.ilike("clinic_address", `%${filters.location}%`);
    }

    if (filters.minRating !== undefined) {
      query = query.gte("average_rating", filters.minRating);
    }

    if (filters.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable);
    }

    if (filters.minExperience !== undefined) {
      query = query.gte("experience_years", filters.minExperience);
    }

    if (filters.maxFee !== undefined) {
      query = query.lte("consultation_fee", filters.maxFee);
    }

    if (filters.search) {
      query = query.or(`
        specialization.ilike.%${filters.search}%,
        qualification.ilike.%${filters.search}%,
        user_profiles.full_name.ilike.%${filters.search}%
      `);
    }

    // Add pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by rating and verification
    query = query.order("average_rating", { ascending: false });
    query = query.order("verified_at", { ascending: false, nullsFirst: false });

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      total: count || 0,
    };
  } catch (error) {
    console.error("Search doctors error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while searching doctors",
    };
  }
} 