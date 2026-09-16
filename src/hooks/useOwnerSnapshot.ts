"use client";

import { useEffect, useState } from "react";
import type { PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import type { RunGuide } from "@/components/dashboard/RunBusinessGuide";

type Dash = {
  guide?: RunGuide;
  stats?: { todaySales?: number; profit?: number; newClients?: number; lowStock?: number };
  week?: { day: string; value: number }[];
};

type Pilot = {
  profile?: PilotProfileRow;
  suggestions?: PilotSuggestionItem[];
  chosenIndex?: number | null;
  plan?: string;
};

export function useOwnerSnapshot() {
  const [profile, setProfile] = useState<PilotProfileRow | null>(null);
  const [guide, setGuide] = useState<RunGuide | null>(null);
  const [todaySales, setTodaySales] = useState(0);
  const [profit, setProfit] = useState(0);
  const [week, setWeek] = useState<{ day: string; value: number }[]>([]);
  const [chosen, setChosen] = useState(false);
  const [chosenItem, setChosenItem] = useState<PilotSuggestionItem | null>(null);
  const [plan, setPlan] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/pilot/state", { credentials: "include", cache: "no-store" }).then(
        (r) => (r.ok ? r.json() : null) as Promise<Pilot | null>,
      ),
      fetch("/api/dashboard", { credentials: "include", cache: "no-store" }).then(
        (r) => (r.ok ? r.json() : null) as Promise<Dash | null>,
      ),
    ])
      .then(([pilot, dash]) => {
        if (cancelled) return;
        setProfile(pilot?.profile ?? null);
        const index = pilot?.chosenIndex;
        const list = pilot?.suggestions ?? [];
        setChosen(typeof index === "number");
        setChosenItem(typeof index === "number" ? (list[index] ?? null) : null);
        setPlan(pilot?.plan ?? "");
        if (dash?.guide) setGuide(dash.guide);
        if (dash?.stats?.todaySales != null) setTodaySales(dash.stats.todaySales);
        if (dash?.stats?.profit != null) setProfit(dash.stats.profit);
        if (dash?.week) setWeek(dash.week);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, guide, todaySales, profit, week, chosen, chosenItem, plan, ready };
}
