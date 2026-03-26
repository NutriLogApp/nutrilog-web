import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/profileService";
import { getDailyStats } from "@/services/statsService";
import { getTodayWater } from "@/services/waterService";
import { todayLocal } from "@/lib/dateUtils";

export function useDailySummary() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const statsQuery = useQuery({
    queryKey: ["dailyStats", todayLocal()],
    queryFn: () => getDailyStats(todayLocal()),
  });

  const waterQuery = useQuery({
    queryKey: ["water"],
    queryFn: getTodayWater,
  });

  const profile = profileQuery.data;
  const stats = statsQuery.data;
  const water = waterQuery.data;

  return {
    profile,
    stats,
    water,
    isLoading: profileQuery.isLoading || statsQuery.isLoading || waterQuery.isLoading,
    caloriesConsumed: stats?.total_calories ?? 0,
    caloriesGoal: profile?.daily_cal_goal ?? 2000,
    proteinConsumed: stats?.total_protein_g ?? 0,
    proteinGoal: profile?.daily_protein_goal_g ?? 120,
    fatConsumed: stats?.total_fat_g ?? 0,
    fatGoal: profile?.daily_fat_goal_g ?? 65,
    carbsConsumed: stats?.total_carbs_g ?? 0,
    carbsGoal: profile?.daily_carbs_goal_g ?? 200,
    waterMl: water?.amount_ml ?? 0,
    waterGoalMl: water?.goal_ml ?? profile?.daily_water_goal_ml ?? 2000,
    streak: profile?.current_streak ?? 0,
    use24h: profile?.use_24h ?? false,
    onboardingDone: profile?.onboarding_done ?? false,
    entries: stats?.entries ?? [],
  };
}
