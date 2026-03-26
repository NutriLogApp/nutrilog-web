import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDailySummary } from "@/hooks/useDailySummary";
import { getDailyInsight } from "@/services/insightService";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickActions } from "@/components/home/QuickActions";
import { InsightLine } from "@/components/home/InsightLine";
import { EntryList } from "@/components/shared/EntryList";
import CompetitionWidget from "@/components/CompetitionWidget";
import LogFoodModal from "@/components/LogFoodModal";
import DrinkPickerModal from "@/components/DrinkPickerModal";
import EntryEditModal from "@/components/EntryEditModal";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import Modal from "@/components/Modal";
import type { EntryOut } from "@/types/api";

export default function HomePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const summary = useDailySummary();
  // Insight query
  const insightQuery = useQuery({
    queryKey: ["insight"],
    queryFn: getDailyInsight,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  // Modal state
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);

  // Invalidation callback after logging food/drink
  const handleDone = () => {
    setShowAddFood(false);
    setShowAddDrink(false);
    qc.invalidateQueries({ queryKey: ["dailyStats"] });
    qc.invalidateQueries({ queryKey: ["water"] });
    qc.invalidateQueries({ queryKey: ["insight"] });
  };

  // Onboarding guard
  if (!summary.isLoading && !summary.onboardingDone) {
    return <OnboardingQuiz onDone={() => qc.invalidateQueries({ queryKey: ["profile"] })} />;
  }

  // Loading state
  if (summary.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-start)" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="animate-fade-up stagger-1">
        <HeroSection
          caloriesConsumed={summary.caloriesConsumed}
          caloriesGoal={summary.caloriesGoal}
          proteinConsumed={summary.proteinConsumed}
          proteinGoal={summary.proteinGoal}
          fatConsumed={summary.fatConsumed}
          fatGoal={summary.fatGoal}
          carbsConsumed={summary.carbsConsumed}
          carbsGoal={summary.carbsGoal}
          waterMl={summary.waterMl}
          waterGoalMl={summary.waterGoalMl}
          streak={summary.streak}
        />
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up stagger-2">
        <QuickActions
          onAddFood={() => setShowAddFood(true)}
          onAddDrink={() => setShowAddDrink(true)}
        />
      </div>

      {/* AI Insight */}
      {insightQuery.data?.suggestion && (
        <div className="animate-fade-up stagger-3">
          <InsightLine
            text={insightQuery.data.suggestion}
            category={insightQuery.data.category}
          />
        </div>
      )}

      {/* Entry List */}
      <div className="animate-fade-up stagger-4 px-4 mt-2">
        <EntryList
          entries={summary.entries}
          use24h={summary.use24h}
          onEdit={(entry) => setEditEntry(entry)}
        />
      </div>

      {/* Competition Widget */}
      <div className="px-4 mt-3">
        <CompetitionWidget />
      </div>

      {/* Log Food Modal */}
      <Modal open={showAddFood} onClose={() => setShowAddFood(false)} title={t("myday.addFood")}>
        <LogFoodModal onDone={handleDone} />
      </Modal>

      {/* Drink Picker Modal */}
      <Modal open={showAddDrink} onClose={() => setShowAddDrink(false)} title={t("myday.addDrink")}>
        <DrinkPickerModal onDone={handleDone} />
      </Modal>

      {/* Entry Edit Modal */}
      <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
        {editEntry && <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />}
      </Modal>

    </div>
  );
}
