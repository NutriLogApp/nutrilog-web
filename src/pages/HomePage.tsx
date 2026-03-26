import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDailySummary } from "@/hooks/useDailySummary";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";
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
import ConfirmDialog from "@/components/ConfirmDialog";
import Modal from "@/components/Modal";
import type { EntryOut } from "@/types/api";

export default function HomePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const summary = useDailySummary();
  const deleteMut = useDeleteEntry();

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
  const [deleteEntry, setDeleteEntry] = useState<EntryOut | null>(null);

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
    <div className="max-w-lg mx-auto" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}>
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
          onDelete={(entry) => setDeleteEntry(entry)}
        />
      </div>

      {/* Competition Widget */}
      <div className="px-4 mt-3">
        <CompetitionWidget />
      </div>

      {/* Log Food Modal */}
      {showAddFood && <LogFoodModal onDone={handleDone} />}

      {/* Drink Picker Modal */}
      {showAddDrink && <DrinkPickerModal onDone={handleDone} />}

      {/* Entry Edit Modal */}
      {editEntry && (
        <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
          <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteEntry}
        message={t("common.deleteConfirm")}
        onConfirm={() => {
          if (deleteEntry) {
            deleteMut.mutate(deleteEntry.id);
            setDeleteEntry(null);
          }
        }}
        onCancel={() => setDeleteEntry(null)}
      />
    </div>
  );
}
