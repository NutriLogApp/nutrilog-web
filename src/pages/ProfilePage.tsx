import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/profileService";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs, { type TabName } from "@/components/profile/ProfileTabs";
import StatsTab from "@/components/profile/StatsTab";
import FriendsTab from "@/components/profile/FriendsTab";
import LogTab from "@/components/profile/LogTab";
import WeightTab from "@/components/profile/WeightTab";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    const hash = window.location.hash.slice(1);
    return ["stats", "friends", "log", "weight"].includes(hash)
      ? (hash as TabName)
      : "stats";
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <ProfileHero profile={profile} />
      <ProfileTabs active={activeTab} onChange={setActiveTab} />
      <div className="px-5 pt-4">
        {activeTab === "stats" && <StatsTab onSwitchTab={setActiveTab} />}
        {activeTab === "friends" && <FriendsTab />}
        {activeTab === "log" && <LogTab />}
        {activeTab === "weight" && <WeightTab />}
      </div>
    </div>
  );
}
