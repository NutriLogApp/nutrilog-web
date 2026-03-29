import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDailySummary } from "@/hooks/useDailySummary";
import { CalorieSummary } from "@/components/home/CalorieSummary";
import { QuickActions } from "@/components/home/QuickActions";
import { EntryList } from "@/components/shared/EntryList";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { respondToRequest } from "@/services/socialService";
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
  // Modal state
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const { items, hasUnread, markRead, lastViewed } = useNotifications(summary.streak);

  const approveMut = useMutation({
    mutationFn: (friendshipId: string) => respondToRequest(friendshipId, "accept"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests"] });
      qc.invalidateQueries({ queryKey: ["friendsLeaderboard"] });
    },
  });

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    markRead();
  };
  const handleCloseNotifications = () => setShowNotifications(false);
  const handleApproveFriend = (friendshipId: string) => {
    approveMut.mutate(friendshipId);
  };

  // Invalidation callback after logging food/drink
  const handleDone = () => {
    setShowAddFood(false);
    setShowAddDrink(false);
    qc.invalidateQueries({ queryKey: ["dailyStats"] });
    qc.invalidateQueries({ queryKey: ["water"] });
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
      {/* Calorie Summary */}
      <div className="animate-fade-up stagger-1">
        <CalorieSummary
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
          onBellClick={handleOpenNotifications}
          hasUnread={hasUnread}
        />
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up stagger-2">
        <QuickActions
          onAddFood={() => setShowAddFood(true)}
          onAddDrink={() => setShowAddDrink(true)}
        />
      </div>

      {/* Entry List */}
      <div className="animate-fade-up stagger-3 px-4 mt-2">
        <EntryList
          entries={summary.entries}
          use24h={summary.use24h}
          onEdit={(entry) => setEditEntry(entry)}
        />
      </div>

      {/* Notification Center */}
      <NotificationCenter
        open={showNotifications}
        items={items}
        lastViewed={lastViewed}
        onClose={handleCloseNotifications}
        onApproveFriend={handleApproveFriend}
      />

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
