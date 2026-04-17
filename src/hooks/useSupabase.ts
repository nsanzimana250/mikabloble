import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase";

interface UseSupabaseOptions {
  table: string;
  select?: string;
  eq?: { column: string; value: any }[];
  order?: { column: string; ascending?: boolean };
}

export const useSupabase = <T>(options: UseSupabaseOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[useSupabase] Session error:", sessionError.message);
      }

      console.log("[useSupabase] Session status:", sessionData?.session ? "authenticated" : "anonymous");

      setSessionChecked(true);

      // Build query
      let query = supabase.from(options.table).select(options.select || "*");

      // Apply filters
      if (options.eq) {
        options.eq.forEach((filter) => {
          query = query.eq(filter.column, filter.value);
        });
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? false 
        });
      }

      // Execute
      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        console.error("[useSupabase] Fetch error:", {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        throw new Error(fetchError.message);
      }

      console.log("[useSupabase] Data fetched:", result?.length ?? 0, "rows");
      setData(result as T[]);

    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("[useSupabase] Error:", error.message);
      setError(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [options.table, options.select, JSON.stringify(options.eq), JSON.stringify(options.order)]);

  // Initial fetch when session is checked
  useEffect(() => {
    if (!sessionChecked) return;
    fetchData();
  }, [sessionChecked, fetchData]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useSupabase] Auth change:", event, session?.user?.id ?? "anonymous");
      setSessionChecked(true);
    });

    // Check session on mount
    supabase.auth.getSession().then(({ data }) => {
      console.log("[useSupabase] Initial session:", data.session?.user?.id ?? "none");
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    sessionChecked,
  };
};