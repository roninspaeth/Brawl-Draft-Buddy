import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Zap, Target, Flame, Cpu, TrendingUp, TrendingDown,
  Minus, Heart, Crosshair, Search, RotateCcw, Swords, Star
} from "lucide-react";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BRAWLERS, MODE_SPECIALTY, SPECIALTY_LABEL } from "@/data/brawlers";
import { MAPS, MODES } from "@/data/maps";
import type { GameMap } from "@/data/maps";

// ── Draft order ────────────────────────────────────────────────────────────────
const DRAFT_ORDER = [
  { team: "Blue", pick: 1 },
  { team: "Red",  pick: 1 },
  { team: "Red",  pick: 2 },
  { team: "Blue", pick: 2 },
  { team: "Blue", pick: 3 },
  { team: "Red",  pick: 3 },
] as const;

type Phase = "setup" | "banning" | "drafting" | "complete";

// ── Role visual helpers ────────────────────────────────────────────────────────
const RoleIcon = ({ role, className }: { role: string; className?: string }) => {
  switch (role) {
    case "Marksman":      return <Target    className={className} />;
    case "Assassin":      return <Zap       className={className} />;
    case "Tank":          return <Shield    className={className} />;
    case "Controller":    return <Cpu       className={className} />;
    case "Artillery":     return <Flame     className={className} />;
    case "Support":       return <Heart     className={className} />;
    case "Damage Dealer": return <Crosshair className={className} />;
    case "Hybrid":        return <Swords    className={className} />;
    default:              return <Star      className={className} />;
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case "Marksman":      return "text-amber-400";
    case "Assassin":      return "text-rose-500";
    case "Tank":          return "text-emerald-400";
    case "Controller":    return "text-cyan-400";
    case "Artillery":     return "text-purple-400";
    case "Support":       return "text-sky-400";
    case "Damage Dealer": return "text-orange-400";
    case "Hybrid":        return "text-violet-400";
    default:              return "text-gray-400";
  }
};

const getRoleBg = (role: string): string => {
  switch (role) {
    case "Marksman":      return "bg-amber-400/10 border-amber-400/30 text-amber-400";
    case "Assassin":      return "bg-rose-500/10 border-rose-500/30 text-rose-500";
    case "Tank":          return "bg-emerald-400/10 border-emerald-400/30 text-emerald-400";
    case "Controller":    return "bg-cyan-400/10 border-cyan-400/30 text-cyan-400";
    case "Artillery":     return "bg-purple-400/10 border-purple-400/30 text-purple-400";
    case "Support":       return "bg-sky-400/10 border-sky-400/30 text-sky-400";
    case "Damage Dealer": return "bg-orange-400/10 border-orange-400/30 text-orange-400";
    case "Hybrid":        return "bg-violet-400/10 border-violet-400/30 text-violet-400";
    default:              return "bg-gray-400/10 border-gray-400/30 text-gray-400";
  }
};

const getRangeBadge = (range: string): string => {
  switch (range) {
    case "Long":   return "bg-rose-950/60 text-rose-300 border-rose-800/50";
    case "Medium": return "bg-amber-950/60 text-amber-300 border-amber-800/50";
    case "Short":  return "bg-emerald-950/60 text-emerald-300 border-emerald-800/50";
    default:       return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
};

// ── Win analysis engine ────────────────────────────────────────────────────────
interface LaneResult {
  lane: number;
  blueBrawler: string;
  redBrawler: string;
  blueWinPct: number;
  factors: string[];
}

const ROLE_ADV: Record<string, string[]> = {
  Tank:           ["Assassin"],
  Marksman:       ["Tank"],
  Controller:     ["Marksman"],
  Assassin:       ["Artillery"],
  Artillery:      ["Controller", "Support"],
  "Damage Dealer":["Tank"],
  Support:        ["Assassin"],
  Hybrid:         ["Assassin", "Artillery"],
};

function calcLaneWinPct(blue: string, red: string, map: GameMap): LaneResult {
  const blueData = BRAWLERS[blue];
  const redData  = BRAWLERS[red];
  if (!blueData || !redData) return { lane: 0, blueBrawler: blue, redBrawler: red, blueWinPct: 50, factors: [] };

  let score = 50;
  const factors: string[] = [];

  // Counter relationships
  if (blueData.counters.includes(red)) { score += 14; factors.push(`${blue} hard counters ${red}`); }
  if (redData.counters.includes(blue))  { score -= 14; factors.push(`${red} hard counters ${blue}`); }

  // Map role synergy
  const blueFits = map.strongRoles.includes(blueData.role as any);
  const redFits  = map.strongRoles.includes(redData.role  as any);
  if (blueFits && !redFits)  { score += 8; factors.push(`${blue} (${blueData.role}) thrives on ${map.name}`); }
  if (!blueFits && redFits)  { score -= 8; factors.push(`${red} (${redData.role}) thrives on ${map.name}`); }

  // Range vs terrain
  const isOpen = map.tags.includes("open");
  const isClosed = map.tags.includes("closed") || map.tags.includes("bush-heavy");
  if (blueData.range === "Long" && isOpen && redData.range !== "Long")  { score += 5; factors.push(`${blue}'s long range dominates open terrain`); }
  if (redData.range  === "Long" && isOpen && blueData.range !== "Long") { score -= 5; factors.push(`${red}'s long range dominates open terrain`); }
  if (blueData.range === "Short" && isClosed && redData.range !== "Short") { score += 5; factors.push(`${blue} closes gaps in tight spaces`); }
  if (redData.range  === "Short" && isClosed && blueData.range !== "Short") { score -= 5; factors.push(`${red} closes gaps in tight spaces`); }

  // General role matchup
  if (ROLE_ADV[blueData.role]?.includes(redData.role)) {
    score += 5;
    factors.push(`${blueData.role} naturally beats ${redData.role}`);
  } else if (ROLE_ADV[redData.role]?.includes(blueData.role)) {
    score -= 5;
    factors.push(`${redData.role} naturally beats ${blueData.role}`);
  }

  const finalPct = Math.min(72, Math.max(28, Math.round(score)));
  return { lane: 0, blueBrawler: blue, redBrawler: red, blueWinPct: finalPct, factors };
}

function computeWinAnalysis(bluePicks: string[], redPicks: string[], map: GameMap) {
  const lanes: LaneResult[] = bluePicks.map((b, i) => ({
    ...calcLaneWinPct(b, redPicks[i], map),
    lane: i + 1,
  }));
  const avg = Math.round(lanes.reduce((s, l) => s + l.blueWinPct, 0) / lanes.length);
  return { lanes, overallBlueWinPct: avg };
}

// ── Recommendation scoring ─────────────────────────────────────────────────────
function scoreBrawler(
  name: string,
  map: GameMap,
  myPicks: string[],
  enemyPicks: string[],
): { score: number; reasons: string[] } {
  const b = BRAWLERS[name];
  if (!b) return { score: 0, reasons: [] };

  let score = 0;
  const reasons: string[] = [];

  // 1. Role affinity to map
  if (map.strongRoles.includes(b.role as any)) {
    score += 35;
    reasons.push(`${b.role} is strong on this map`);
  }

  // 2. Range vs terrain
  const isOpen   = map.tags.includes("open");
  const isBusy   = map.tags.includes("closed") || map.tags.includes("bush-heavy");
  if (b.range === "Long" && isOpen)    { score += 20; reasons.push("Long range suits this open map"); }
  else if (b.range === "Short" && isBusy) { score += 20; reasons.push("Short range thrives in tight spaces"); }
  else if (b.range === "Medium")       { score += 10; reasons.push("Adaptable medium range"); }

  // 3. Map-tag terrain overlap
  const tagMatches = b.mapTags.filter(t => map.tags.includes(t as any)).length;
  if (tagMatches >= 2) { score += 15; reasons.push("Ideal terrain fit"); }
  else if (tagMatches === 1) { score += 8;  reasons.push("Good terrain fit"); }

  // 4. Counter bonuses
  for (const enemy of enemyPicks) {
    const ed = BRAWLERS[enemy];
    if (!ed) continue;
    if (b.counters.includes(enemy))   { score += 20; reasons.push(`Counters ${enemy}`); }
    if (ed.counters.includes(name))   { score -= 25; reasons.push(`Weak to ${enemy}`); }
  }

  // 5. Mode-specific specialty bonus
  const specialtyTag = MODE_SPECIALTY[map.mode];
  if (specialtyTag && b.specialtyTags?.includes(specialtyTag)) {
    score += 18;
    reasons.push(`${SPECIALTY_LABEL[specialtyTag]} on ${map.mode}`);
  }

  // 6. Team role diversity
  const myRoles = myPicks.map(p => BRAWLERS[p]?.role).filter(Boolean);
  if (myPicks.length > 0 && !myRoles.includes(b.role)) {
    score += 10;
    reasons.push("Adds role diversity");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

// ── All roles for filter ───────────────────────────────────────────────────────
const ALL_ROLES = [
  "Tank", "Assassin", "Marksman", "Support",
  "Damage Dealer", "Artillery", "Controller", "Hybrid",
] as const;

// ── Component ──────────────────────────────────────────────────────────────────
export default function DraftPicker() {
  const [phase, setPhase]             = useState<Phase>("setup");
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [banned, setBanned]           = useState<string[]>([]);
  const [bluePicks, setBluePicks]     = useState<string[]>([]);
  const [redPicks, setRedPicks]       = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState<string | null>(null);

  const mapData    = MAPS.find(m => m.name === selectedMap) ?? null;
  const activeTeam = phase === "drafting" ? DRAFT_ORDER[currentStep]?.team : null;

  const handleReset = () => {
    setPhase("setup");
    setSelectedMap(null);
    setBanned([]);
    setBluePicks([]);
    setRedPicks([]);
    setCurrentStep(0);
    setSearch("");
    setRoleFilter(null);
  };

  const handleBrawlerClick = (name: string) => {
    if (phase === "banning") {
      if (banned.includes(name))       { setBanned(banned.filter(b => b !== name)); return; }
      if (banned.length < 6)           { setBanned([...banned, name]); }
    } else if (phase === "drafting") {
      if (banned.includes(name) || bluePicks.includes(name) || redPicks.includes(name)) return;
      if (activeTeam === "Blue")       { setBluePicks([...bluePicks, name]); }
      else                             { setRedPicks([...redPicks, name]); }
      if (currentStep < 5)             { setCurrentStep(currentStep + 1); }
      else                             { setPhase("complete"); }
    }
  };

  // Filtered brawler list
  const filteredBrawlers = useMemo(() => {
    return Object.entries(BRAWLERS).filter(([name, data]) => {
      const matchSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchRole   = !roleFilter || data.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [search, roleFilter]);

  // Recommendations
  const recommendations = useMemo(() => {
    if (phase !== "drafting" || !mapData || !activeTeam) return [];
    const myPicks    = activeTeam === "Blue" ? bluePicks : redPicks;
    const enemyPicks = activeTeam === "Blue" ? redPicks  : bluePicks;
    const used       = new Set([...banned, ...bluePicks, ...redPicks]);

    return Object.keys(BRAWLERS)
      .filter(name => !used.has(name))
      .map(name => {
        const { score, reasons } = scoreBrawler(name, mapData, myPicks, enemyPicks);
        return { name, score, reasons, role: BRAWLERS[name].role, range: BRAWLERS[name].range };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [phase, mapData, activeTeam, banned, bluePicks, redPicks]);

  // Win analysis
  const winAnalysis = useMemo(() => {
    if (phase !== "complete" || !mapData || bluePicks.length < 3 || redPicks.length < 3) return null;
    return computeWinAnalysis(bluePicks, redPicks, mapData);
  }, [phase, mapData, bluePicks, redPicks]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-primary drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              Draft Picker
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Brawl Stars Ranked</p>
          </div>

          {/* Map selector */}
          <div className="flex-1 w-full sm:w-auto">
            <Select value={selectedMap ?? ""} onValueChange={setSelectedMap} disabled={phase !== "setup"}>
              <SelectTrigger className="w-full sm:w-72 bg-card border-border/50 text-sm h-9">
                <SelectValue placeholder="Select map & mode…" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {MODES.map(mode => (
                  <SelectGroup key={mode}>
                    <SelectLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2 py-1">
                      {mode}
                    </SelectLabel>
                    {MAPS.filter(m => m.mode === mode).map(m => (
                      <SelectItem key={m.name} value={m.name}>
                        <span className="font-semibold">{m.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">· {m.label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map affinity tags (when selected) */}
          {mapData && (
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
              {mapData.tags.map(t => (
                <span key={t} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-border/50 bg-card text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {phase === "setup" && (
              <Button
                onClick={() => { if (selectedMap) setPhase("banning"); }}
                disabled={!selectedMap}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-xs"
              >
                Start Draft
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-border/50 hover:bg-destructive/20 hover:text-destructive transition-colors gap-1.5 text-xs"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 flex flex-col gap-4">

        {/* Setup prompt */}
        {phase === "setup" && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center max-w-sm">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-xl font-bold mb-2">Select a map to begin</h2>
              <p className="text-sm text-muted-foreground">Choose from 24 ranked maps across 6 modes. The draft tool will recommend brawlers based on map terrain and role synergy.</p>
            </div>
          </div>
        )}

        {/* ── Ban phase ── */}
        {phase === "banning" && (
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-rose-400">Ban Phase</h2>
                <p className="text-sm text-muted-foreground">
                  Click brawlers to ban them ({banned.length}/6) — click again to un-ban
                </p>
              </div>
              <Button
                onClick={() => setPhase("drafting")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs px-6 flex-shrink-0"
                size="sm"
              >
                {banned.length > 0 ? `Confirm ${banned.length} Ban${banned.length > 1 ? "s" : ""} & Draft` : "Skip Bans"}
              </Button>
            </div>
            {banned.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {banned.map(b => (
                  <button
                    key={b}
                    onClick={() => setBanned(banned.filter(x => x !== b))}
                    className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border border-rose-800/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900/40 transition-colors"
                  >
                    <span>{b}</span>
                    <span className="text-rose-600">✕</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Draft timeline ── */}
        {(phase === "drafting" || phase === "complete") && (
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {DRAFT_ORDER.map((slot, i) => {
              const isBlue = slot.team === "Blue";
              const isPast   = (phase === "complete") || i < currentStep;
              const isActive = i === currentStep && phase === "drafting";

              let brawlerName = "";
              if (isPast) {
                if (isBlue) {
                  const bi = DRAFT_ORDER.slice(0, i + 1).filter(s => s.team === "Blue").length - 1;
                  brawlerName = bluePicks[bi] ?? "";
                } else {
                  const ri = DRAFT_ORDER.slice(0, i + 1).filter(s => s.team === "Red").length - 1;
                  brawlerName = redPicks[ri] ?? "";
                }
              }
              const bData = brawlerName ? BRAWLERS[brawlerName] : null;

              return (
                <div
                  key={i}
                  className={`flex-shrink-0 flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 w-[90px] sm:w-28 transition-all duration-300 ${
                    isActive
                      ? isBlue
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                        : "border-red-500 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      : isPast
                        ? isBlue ? "border-blue-900/50 bg-blue-900/20" : "border-red-900/50 bg-red-900/20"
                        : "border-border/40 bg-card/30"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isBlue ? "text-blue-400" : "text-red-400"}`}>
                    {slot.team} {slot.pick}
                  </span>
                  {brawlerName && bData ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className={`p-1 rounded border ${getRoleBg(bData.role)}`}>
                        <RoleIcon role={bData.role} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-center leading-tight w-full truncate">{brawlerName}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Waiting…</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Recommendations ── */}
        {phase === "drafting" && recommendations.length > 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-xl">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                activeTeam === "Blue"
                  ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                  : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"
              }`} />
              <span className="uppercase tracking-wider">
                Top Picks for <span className={activeTeam === "Blue" ? "text-blue-400" : "text-red-400"}>{activeTeam}</span>
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={rec.name}
                  className={`relative overflow-hidden rounded-lg border bg-background/50 p-3 ${
                    idx === 0
                      ? "border-primary/50 shadow-[0_0_12px_rgba(251,191,36,0.12)]"
                      : "border-border/40"
                  }`}
                >
                  {idx === 0 && (
                    <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded">
                      Best
                    </span>
                  )}
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`p-1.5 rounded border flex-shrink-0 ${getRoleBg(rec.role)}`}>
                      <RoleIcon role={rec.role} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-tight truncate">{rec.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-semibold ${getRoleColor(rec.role)}`}>{rec.role}</span>
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${getRangeBadge(rec.range)}`}>
                          {rec.range}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-lg font-black text-primary leading-none">{rec.score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mb-2">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-700"
                      style={{ width: `${rec.score}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {rec.reasons.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-1.5 py-0.5 rounded leading-tight ${
                          r.startsWith("Weak") ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {r.startsWith("Weak") ? "⚠ " : "✓ "}{r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Brawler grid ── */}
        {(phase === "banning" || phase === "drafting") && (
          <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
            {/* Search + role filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search brawler…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5 flex-shrink-0">
                <button
                  onClick={() => setRoleFilter(null)}
                  className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                    roleFilter === null
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  All
                </button>
                {ALL_ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(roleFilter === role ? null : role)}
                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
                      roleFilter === role
                        ? `${getRoleBg(role)}`
                        : "border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <RoleIcon role={role} className="w-2.5 h-2.5" />
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground mb-2">
              {filteredBrawlers.length} brawler{filteredBrawlers.length !== 1 ? "s" : ""}
              {(search || roleFilter) && " (filtered)"}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5">
              {filteredBrawlers.map(([name, data]) => {
                const isBanned   = banned.includes(name);
                const isBlue     = bluePicks.includes(name);
                const isRed      = redPicks.includes(name);
                const unavail    = isBanned || isBlue || isRed;
                const isRecommended = recommendations.some(r => r.name === name);

                return (
                  <motion.button
                    key={name}
                    whileHover={!unavail ? { scale: 1.06 } : {}}
                    whileTap={!unavail ? { scale: 0.94 } : {}}
                    onClick={() => handleBrawlerClick(name)}
                    disabled={unavail && phase === "drafting"}
                    className={`relative p-2 rounded-lg border text-center flex flex-col items-center gap-1 overflow-hidden transition-all duration-150 ${
                      isBanned
                        ? "border-rose-900/30 bg-rose-950/10 opacity-40 cursor-not-allowed"
                        : isBlue
                          ? "border-blue-700/50 bg-blue-900/20 opacity-50 cursor-not-allowed"
                          : isRed
                            ? "border-red-700/50 bg-red-900/20 opacity-50 cursor-not-allowed"
                            : isRecommended && phase === "drafting"
                              ? "border-primary/60 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                              : "border-border/40 bg-background hover:border-border hover:bg-card cursor-pointer"
                    }`}
                  >
                    <RoleIcon role={data.role} className={`w-4 h-4 ${getRoleColor(data.role)}`} />
                    <span className="text-[10px] font-bold leading-tight w-full truncate">{name}</span>
                    <span className={`text-[8px] font-bold px-1 rounded border ${getRangeBadge(data.range)}`}>
                      {data.range[0]}
                    </span>

                    {isBanned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-950/50 z-10">
                        <span className="text-rose-500 font-black text-[9px] uppercase tracking-widest rotate-[-15deg] border border-rose-500 px-1 rounded bg-background/80">
                          Banned
                        </span>
                      </div>
                    )}
                    {isBlue && (
                      <div className="absolute inset-0 bg-blue-500/10 z-10 flex items-end justify-center pb-0.5">
                        <span className="text-blue-400 text-[8px] font-black uppercase">Blue</span>
                      </div>
                    )}
                    {isRed && (
                      <div className="absolute inset-0 bg-red-500/10 z-10 flex items-end justify-center pb-0.5">
                        <span className="text-red-400 text-[8px] font-black uppercase">Red</span>
                      </div>
                    )}
                    {isRecommended && !unavail && phase === "drafting" && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Draft complete ── */}
        {phase === "complete" && winAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Overall probability */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-2xl">
              <h2 className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">
                Draft Win Probability · {mapData?.name}
              </h2>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-1">Blue Team</span>
                  <span className="font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]" style={{ fontSize: "clamp(2rem,6vw,3rem)", lineHeight: 1 }}>
                    {winAnalysis.overallBlueWinPct}%
                  </span>
                </div>
                <span className="text-2xl font-black text-muted-foreground/30">VS</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block mb-1">Red Team</span>
                  <span className="font-black text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]" style={{ fontSize: "clamp(2rem,6vw,3rem)", lineHeight: 1 }}>
                    {100 - winAnalysis.overallBlueWinPct}%
                  </span>
                </div>
              </div>

              <div className="relative h-4 rounded-full overflow-hidden bg-muted flex">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  initial={{ width: "50%" }}
                  animate={{ width: `${winAnalysis.overallBlueWinPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 flex-1"
                  initial={{ width: "50%" }}
                  animate={{ width: `${100 - winAnalysis.overallBlueWinPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-background/60" />
              </div>

              <div className="mt-4 text-center">
                {winAnalysis.overallBlueWinPct >= 58 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-4 py-1.5 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" /> Blue Team Draft Advantage
                  </span>
                )}
                {winAnalysis.overallBlueWinPct <= 42 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-4 py-1.5 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" /> Red Team Draft Advantage
                  </span>
                )}
                {winAnalysis.overallBlueWinPct > 42 && winAnalysis.overallBlueWinPct < 58 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full">
                    <Minus className="w-3.5 h-3.5" /> Even Draft — Skill Will Decide
                  </span>
                )}
              </div>
            </div>

            {/* Lane breakdown */}
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
              Lane Matchup Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {winAnalysis.lanes.map(lane => {
                const blueWin = lane.blueWinPct;
                const redWin  = 100 - blueWin;
                const verdict = blueWin >= 58 ? "blue" : blueWin <= 42 ? "red" : "even";
                const blueB   = BRAWLERS[lane.blueBrawler];
                const redB    = BRAWLERS[lane.redBrawler];

                return (
                  <motion.div
                    key={lane.lane}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lane.lane * 0.1, duration: 0.4 }}
                    className={`bg-card rounded-xl border overflow-hidden ${
                      verdict === "blue" ? "border-blue-500/40" :
                      verdict === "red"  ? "border-red-500/40"  :
                                           "border-amber-400/30"
                    }`}
                  >
                    <div className={`px-3 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${
                      verdict === "blue" ? "bg-blue-500/10 text-blue-400" :
                      verdict === "red"  ? "bg-red-500/10 text-red-400"   :
                                           "bg-amber-400/10 text-amber-400"
                    }`}>
                      <span>Lane {lane.lane}</span>
                      <span className="flex items-center gap-1">
                        {verdict === "blue" && <><TrendingUp className="w-3 h-3" /> Blue</>}
                        {verdict === "red"  && <><TrendingDown className="w-3 h-3" /> Red</>}
                        {verdict === "even" && <><Minus className="w-3 h-3" /> Even</>}
                      </span>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        {/* Blue brawler */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className={`p-1.5 rounded border ${getRoleBg(blueB?.role ?? "")}`}>
                            <RoleIcon role={blueB?.role ?? ""} className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-center leading-tight truncate w-full">{lane.blueBrawler}</span>
                          <span className={`text-[9px] font-semibold ${getRoleColor(blueB?.role ?? "")}`}>{blueB?.role}</span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/40">VS</span>
                        {/* Red brawler */}
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className={`p-1.5 rounded border ${getRoleBg(redB?.role ?? "")}`}>
                            <RoleIcon role={redB?.role ?? ""} className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-center leading-tight truncate w-full">{lane.redBrawler}</span>
                          <span className={`text-[9px] font-semibold ${getRoleColor(redB?.role ?? "")}`}>{redB?.role}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-blue-400">{blueWin}%</span>
                          <span className="text-red-400">{redWin}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-muted flex">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                            initial={{ width: "50%" }}
                            animate={{ width: `${blueWin}%` }}
                            transition={{ delay: lane.lane * 0.1 + 0.25, duration: 0.8, ease: "easeOut" }}
                          />
                          <motion.div
                            className="h-full bg-gradient-to-l from-red-600 to-red-400 flex-1"
                            initial={{ width: "50%" }}
                            animate={{ width: `${redWin}%` }}
                            transition={{ delay: lane.lane * 0.1 + 0.25, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {lane.factors.length > 0 && (
                        <div className="flex flex-col gap-0.5 pt-1 border-t border-border/40">
                          {lane.factors.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-[9px] text-muted-foreground leading-snug">• {f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Team compositions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-gradient-to-br from-blue-950/40 to-background border border-blue-900/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-blue-400 mb-3 uppercase tracking-wider text-center">Blue Team</h3>
                <div className="flex flex-col gap-2">
                  {bluePicks.map((p, i) => {
                    const bd = BRAWLERS[p];
                    return (
                      <div key={i} className="flex items-center gap-2.5 bg-background/50 border border-blue-900/30 p-2.5 rounded-lg">
                        <RoleIcon role={bd?.role ?? ""} className={`w-4 h-4 flex-shrink-0 ${getRoleColor(bd?.role ?? "")}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold block truncate">{p}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{bd?.role}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRangeBadge(bd?.range ?? "")}`}>
                          {bd?.range}
                        </span>
                        <span className="text-blue-400 font-black text-xs ml-1">
                          {winAnalysis.lanes[i]?.blueWinPct ?? "—"}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center font-black text-3xl text-muted-foreground/20">VS</div>

              <div className="flex-1 bg-gradient-to-br from-red-950/40 to-background border border-red-900/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-red-400 mb-3 uppercase tracking-wider text-center">Red Team</h3>
                <div className="flex flex-col gap-2">
                  {redPicks.map((p, i) => {
                    const rd = BRAWLERS[p];
                    return (
                      <div key={i} className="flex items-center gap-2.5 bg-background/50 border border-red-900/30 p-2.5 rounded-lg">
                        <RoleIcon role={rd?.role ?? ""} className={`w-4 h-4 flex-shrink-0 ${getRoleColor(rd?.role ?? "")}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold block truncate">{p}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{rd?.role}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRangeBadge(rd?.range ?? "")}`}>
                          {rd?.range}
                        </span>
                        <span className="text-red-400 font-black text-xs ml-1">
                          {winAnalysis.lanes[i] ? (100 - winAnalysis.lanes[i].blueWinPct) : "—"}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* New draft CTA */}
            <div className="text-center pb-4">
              <Button
                onClick={handleReset}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider gap-2"
              >
                <RotateCcw className="w-4 h-4" /> New Draft
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
