import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Target, Flame, Cpu, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BRAWLERS: Record<string, { role: string; archetypes: string[]; counters: string[] }> = {
  Piper:     { role: "Marksman",   archetypes: ["Open","DPS"],      counters: ["Mortis","Edgar","Leon"] },
  Colt:      { role: "Marksman",   archetypes: ["Open","DPS"],      counters: ["Frank","Rosa","Bull"] },
  Brock:     { role: "Marksman",   archetypes: ["Open","Walls"],    counters: ["Mortis","Edgar"] },
  Belle:     { role: "Marksman",   archetypes: ["Open","Balanced"], counters: ["Mortis","Crow"] },
  Dynamike:  { role: "Artillery",  archetypes: ["Walls","Bushy"],   counters: ["Mortis","Crow","Edgar"] },
  Tick:      { role: "Artillery",  archetypes: ["Walls","Balanced"],counters: ["Mortis","Leon"] },
  Barley:    { role: "Artillery",  archetypes: ["Walls","Bushy"],   counters: ["Mortis","Edgar"] },
  Gene:      { role: "Controller", archetypes: ["Balanced","Walls"],counters: ["Piper","Brock"] },
  Max:       { role: "Controller", archetypes: ["Balanced","Bushy"],counters: ["Piper","Belle"] },
  Colette:   { role: "Controller", archetypes: ["Balanced","DPS"],  counters: ["Frank","Bull","Rosa"] },
  Rico:      { role: "Controller", archetypes: ["Walls","DPS"],     counters: ["Mortis","Edgar"] },
  Spike:     { role: "Controller", archetypes: ["Open","Balanced"], counters: ["Mortis","Edgar"] },
  Tara:      { role: "Controller", archetypes: ["Balanced","Bushy"],counters: ["Leon","Mortis"] },
  Mortis:    { role: "Assassin",   archetypes: ["Bushy","Balanced"],counters: ["Frank","Rosa","Poco"] },
  Edgar:     { role: "Assassin",   archetypes: ["Bushy","Walls"],   counters: ["Frank","Poco","Pam"] },
  Leon:      { role: "Assassin",   archetypes: ["Bushy","Balanced"],counters: ["Gene","Tara"] },
  Crow:      { role: "Assassin",   archetypes: ["Open","Balanced"], counters: ["Frank","Bull"] },
  Frank:     { role: "Tank",       archetypes: ["Bushy","DPS"],     counters: ["Piper","Brock","Colt"] },
  Bull:      { role: "Tank",       archetypes: ["Bushy","DPS"],     counters: ["Piper","Belle","Colt"] },
  Rosa:      { role: "Tank",       archetypes: ["Bushy","Walls"],   counters: ["Piper","Brock"] },
};

const MAPS = [
  { name: "Shooting Star",       mode: "Bounty",    archetype: "Open",     label: "Open / Long Range" },
  { name: "Snake Prairie",       mode: "Bounty",    archetype: "Bushy",    label: "Heavy Bush / Close Range" },
  { name: "Split",               mode: "Hot Zone",  archetype: "Walls",    label: "Wall Heavy / Lanes" },
  { name: "Brawl Ball Meta Map", mode: "Brawl Ball",archetype: "Balanced", label: "Balanced / Mid Range" },
  { name: "Safe Zone",           mode: "Heist",     archetype: "DPS",      label: "High DPS / Base Race" },
];

const ARCHETYPE_ROLES: Record<string, string[]> = {
  Open:     ["Marksman"],
  Bushy:    ["Assassin", "Tank"],
  Walls:    ["Artillery", "Controller"],
  Balanced: ["Controller", "Marksman", "Assassin"],
  DPS:      ["Tank", "Controller", "Marksman"],
};

const DRAFT_ORDER = [
  { team: "Blue", pick: 1 },
  { team: "Red",  pick: 1 },
  { team: "Red",  pick: 2 },
  { team: "Blue", pick: 2 },
  { team: "Blue", pick: 3 },
  { team: "Red",  pick: 3 },
];

type Phase = "setup" | "banning" | "drafting" | "complete";

// ---------------------------------------------------------------------------
// Win Probability Engine
// ---------------------------------------------------------------------------

interface LaneResult {
  lane: number;
  blueBrawler: string;
  redBrawler: string;
  blueWinPct: number;
  factors: string[];
}

function calcLaneWinPct(blue: string, red: string, archetype: string): LaneResult {
  const blueData = BRAWLERS[blue];
  const redData  = BRAWLERS[red];

  let blueScore = 50;
  const factors: string[] = [];

  // Counter effects: +15 if blue counters red, -15 if red counters blue
  if (blueData.counters.includes(red)) {
    blueScore += 15;
    factors.push(`${blue} hard counters ${red}`);
  }
  if (redData.counters.includes(blue)) {
    blueScore -= 15;
    factors.push(`${red} hard counters ${blue}`);
  }

  // Map synergy delta: +8 if blue fits, -8 if red fits, cancel out if both fit
  const preferredRoles = ARCHETYPE_ROLES[archetype] ?? [];
  const blueFits = preferredRoles.includes(blueData.role);
  const redFits  = preferredRoles.includes(redData.role);
  if (blueFits && !redFits) {
    blueScore += 8;
    factors.push(`${blue} (${blueData.role}) thrives on this map`);
  } else if (!blueFits && redFits) {
    blueScore -= 8;
    factors.push(`${red} (${redData.role}) thrives on this map`);
  }

  // Role matchup bonuses (Tank > Assassin, Marksman > Tank, Controller > Marksman)
  const roleAdv: Record<string, string[]> = {
    Tank:       ["Assassin"],
    Marksman:   ["Tank"],
    Controller: ["Marksman"],
    Assassin:   ["Artillery"],
    Artillery:  ["Controller"],
  };
  if (roleAdv[blueData.role]?.includes(redData.role)) {
    blueScore += 6;
    factors.push(`${blueData.role} naturally beats ${redData.role}`);
  } else if (roleAdv[redData.role]?.includes(blueData.role)) {
    blueScore -= 6;
    factors.push(`${redData.role} naturally beats ${blueData.role}`);
  }

  // Clamp to [28, 72] — no certainties in Brawl Stars
  const finalPct = Math.min(72, Math.max(28, Math.round(blueScore)));
  return { lane: 0, blueBrawler: blue, redBrawler: red, blueWinPct: finalPct, factors };
}

function computeWinAnalysis(
  bluePicks: string[],
  redPicks: string[],
  archetype: string,
): { lanes: LaneResult[]; overallBlueWinPct: number } {
  const lanes: LaneResult[] = bluePicks.map((b, i) => ({
    ...calcLaneWinPct(b, redPicks[i], archetype),
    lane: i + 1,
  }));
  const avg = Math.round(lanes.reduce((s, l) => s + l.blueWinPct, 0) / lanes.length);
  return { lanes, overallBlueWinPct: avg };
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

const RoleIcon = ({ role, className }: { role: string; className?: string }) => {
  switch (role) {
    case "Marksman":   return <Target  className={className} />;
    case "Assassin":   return <Zap     className={className} />;
    case "Tank":       return <Shield  className={className} />;
    case "Controller": return <Cpu     className={className} />;
    case "Artillery":  return <Flame   className={className} />;
    default:           return null;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Marksman":   return "text-amber-400";
    case "Assassin":   return "text-rose-500";
    case "Tank":       return "text-emerald-400";
    case "Controller": return "text-cyan-400";
    case "Artillery":  return "text-purple-400";
    default:           return "text-gray-400";
  }
};

const getRoleBg = (role: string) => {
  switch (role) {
    case "Marksman":   return "bg-amber-400/10 border-amber-400/30 text-amber-400";
    case "Assassin":   return "bg-rose-500/10 border-rose-500/30 text-rose-500";
    case "Tank":       return "bg-emerald-400/10 border-emerald-400/30 text-emerald-400";
    case "Controller": return "bg-cyan-400/10 border-cyan-400/30 text-cyan-400";
    case "Artillery":  return "bg-purple-400/10 border-purple-400/30 text-purple-400";
    default:           return "bg-gray-400/10 border-gray-400/30 text-gray-400";
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DraftPicker() {
  const [phase, setPhase]           = useState<Phase>("setup");
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [banned, setBanned]         = useState<string[]>([]);
  const [bluePicks, setBluePicks]   = useState<string[]>([]);
  const [redPicks, setRedPicks]     = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const activeTeam = phase === "drafting" ? DRAFT_ORDER[currentStep]?.team : null;
  const mapData    = MAPS.find((m) => m.name === selectedMap);

  const handleStartBanning = () => { if (selectedMap) setPhase("banning"); };
  const handleStartDraft   = () => { setPhase("drafting"); };

  const handleReset = () => {
    setPhase("setup");
    setSelectedMap(null);
    setBanned([]);
    setBluePicks([]);
    setRedPicks([]);
    setCurrentStep(0);
  };

  const handleBrawlerClick = (name: string) => {
    if (phase === "banning") {
      if (banned.includes(name)) {
        setBanned(banned.filter((b) => b !== name));
      } else if (banned.length < 4) {
        setBanned([...banned, name]);
      }
    } else if (phase === "drafting") {
      if (banned.includes(name) || bluePicks.includes(name) || redPicks.includes(name)) return;
      if (activeTeam === "Blue") {
        setBluePicks([...bluePicks, name]);
      } else {
        setRedPicks([...redPicks, name]);
      }
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        setPhase("complete");
      }
    }
  };

  // Recommendation scoring
  const recommendations = useMemo(() => {
    if (phase !== "drafting" || !mapData || !activeTeam) return [];
    const myPicks    = activeTeam === "Blue" ? bluePicks : redPicks;
    const enemyPicks = activeTeam === "Blue" ? redPicks  : bluePicks;
    const available  = Object.keys(BRAWLERS).filter(
      (b) => !banned.includes(b) && !bluePicks.includes(b) && !redPicks.includes(b)
    );
    const squishyRoles = ["Marksman", "Assassin", "Artillery"];
    const sturdyRoles  = ["Tank", "Controller"];
    const mySquishyCount = myPicks.filter(p => squishyRoles.includes(BRAWLERS[p].role)).length;
    const mySturdyCount  = myPicks.filter(p => sturdyRoles.includes(BRAWLERS[p].role)).length;

    return available.map(name => {
      const b = BRAWLERS[name];
      let score = 0;
      const reasons: string[] = [];
      if (ARCHETYPE_ROLES[mapData.archetype].includes(b.role)) {
        score += 40; reasons.push("+40 Map Synergy");
      }
      if (mySquishyCount >= 2 && sturdyRoles.includes(b.role)) {
        score += 20; reasons.push("+20 Balances Team");
      } else if (mySturdyCount >= 2 && squishyRoles.includes(b.role)) {
        score += 20; reasons.push("+20 Balances Team");
      } else if (myPicks.length === 0) {
        score += 10; reasons.push("+10 Solid Early Pick");
      }
      let counterScore = 0;
      for (const enemy of enemyPicks) {
        if (b.counters.includes(enemy))               { counterScore += 30; reasons.push(`+30 Counters ${enemy}`); }
        if (BRAWLERS[enemy].counters.includes(name))  { counterScore -= 40; reasons.push(`-40 Weak to ${enemy}`); }
      }
      score += counterScore;
      return { name, score: Math.max(0, Math.min(100, score)), reasons, role: b.role };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  }, [phase, mapData, activeTeam, banned, bluePicks, redPicks]);

  // Win probability — only when draft is complete
  const winAnalysis = useMemo(() => {
    if (phase !== "complete" || !mapData || bluePicks.length < 3 || redPicks.length < 3) return null;
    return computeWinAnalysis(bluePicks, redPicks, mapData.archetype);
  }, [phase, mapData, bluePicks, redPicks]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8 font-sans selection:bg-primary/30">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-primary drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            Draft Picker
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Brawl Stars Ranked</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={selectedMap || ""} onValueChange={setSelectedMap} disabled={phase !== "setup"}>
            <SelectTrigger className="w-[280px] bg-card border-border/50">
              <SelectValue placeholder="Select Map & Mode" />
            </SelectTrigger>
            <SelectContent>
              {MAPS.map(m => (
                <SelectItem key={m.name} value={m.name}>
                  <div className="flex flex-col">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.mode} • {m.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {phase === "setup" && (
            <Button onClick={handleStartBanning} disabled={!selectedMap}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
              Start
            </Button>
          )}
          {phase !== "setup" && (
            <Button variant="outline" onClick={handleReset}
              className="border-border/50 hover:bg-destructive/20 hover:text-destructive transition-colors">
              Reset
            </Button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-8">

        {/* Ban phase + timeline */}
        {phase !== "setup" && (
          <div className="flex flex-col gap-6">
            {phase === "banning" && (
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 text-center shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-rose-500">Ban Phase</h2>
                <p className="text-muted-foreground mb-6">Select up to 4 brawlers to ban ({banned.length}/4)</p>
                <Button onClick={handleStartDraft}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase px-8">
                  {banned.length > 0 ? "Confirm Bans & Start Draft" : "Skip Bans"}
                </Button>
              </div>
            )}

            {(phase === "drafting" || phase === "complete") && (
              <div className="flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {DRAFT_ORDER.map((slot, i) => {
                    const isPast   = i < currentStep;
                    const isActive = i === currentStep && phase === "drafting";
                    const isBlue   = slot.team === "Blue";
                    let brawlerName = "";
                    if (isPast || phase === "complete") {
                      if (isBlue) {
                        const blueIndex = DRAFT_ORDER.slice(0, i + 1).filter(s => s.team === "Blue").length - 1;
                        brawlerName = bluePicks[blueIndex];
                      } else {
                        const redIndex = DRAFT_ORDER.slice(0, i + 1).filter(s => s.team === "Red").length - 1;
                        brawlerName = redPicks[redIndex];
                      }
                    }
                    return (
                      <div key={i} className={`flex flex-col items-center p-3 rounded-lg border-2 w-28 transition-all duration-300 ${
                        isActive
                          ? isBlue ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                   : "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          : isPast
                            ? isBlue ? "border-blue-900/50 bg-blue-900/20" : "border-red-900/50 bg-red-900/20"
                            : "border-border/50 bg-card/30"
                      }`}>
                        <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${isBlue ? "text-blue-400" : "text-red-400"}`}>
                          {slot.team} {slot.pick}
                        </span>
                        {brawlerName ? (
                          <div className="flex flex-col items-center">
                            <RoleIcon role={BRAWLERS[brawlerName].role}
                              className={`w-5 h-5 mb-1 ${getRoleColor(BRAWLERS[brawlerName].role)}`} />
                            <span className="text-sm font-bold truncate w-full text-center">{brawlerName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Waiting...</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {phase === "drafting" && recommendations.length > 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${activeTeam === "Blue"
                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`} />
              Top Recommendations for {activeTeam}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.name} className={`relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-4 transition-all
                  ${rec.score >= 70 ? "ring-1 ring-primary/50 shadow-[0_0_15px_rgba(251,191,36,0.15)]" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <RoleIcon role={rec.role} className={`w-5 h-5 ${getRoleColor(rec.role)}`} />
                      <span className="text-xl font-bold">{rec.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">{rec.score}</span>
                      <span className="text-xs text-muted-foreground block">Score</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-1000" style={{ width: `${rec.score}%` }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {rec.reasons.map((r, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded bg-card border border-border/50
                        ${r.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brawler Grid */}
        {(phase === "banning" || phase === "drafting") && (
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-muted-foreground uppercase tracking-wider">Roster</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.entries(BRAWLERS).map(([name, data]) => {
                const isBanned    = banned.includes(name);
                const isBluePick  = bluePicks.includes(name);
                const isRedPick   = redPicks.includes(name);
                const isUnavailable = isBanned || isBluePick || isRedPick;
                return (
                  <motion.button
                    key={name}
                    whileHover={!isUnavailable ? { scale: 1.05 } : {}}
                    whileTap={!isUnavailable ? { scale: 0.95 } : {}}
                    onClick={() => handleBrawlerClick(name)}
                    disabled={isUnavailable}
                    data-testid={`brawler-card-${name}`}
                    className={`relative p-3 rounded-lg border text-left flex flex-col gap-2 overflow-hidden transition-colors
                      ${isBanned    ? "border-rose-900/30 bg-rose-950/10 opacity-50 cursor-not-allowed" : ""}
                      ${isBluePick  ? "border-blue-900/50 bg-blue-900/20 opacity-60 cursor-not-allowed" : ""}
                      ${isRedPick   ? "border-red-900/50  bg-red-900/20  opacity-60 cursor-not-allowed" : ""}
                      ${!isUnavailable ? "border-border/50 bg-background hover:border-primary/50 hover:bg-card cursor-pointer" : ""}
                    `}>
                    <div className="flex items-center gap-2 relative z-10">
                      <RoleIcon role={data.role} className={`w-4 h-4 ${getRoleColor(data.role)}`} />
                      <span className="font-bold text-sm">{name}</span>
                    </div>
                    {isBanned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-950/40 z-20">
                        <span className="text-rose-500 font-black uppercase tracking-widest rotate-[-15deg] border-2 border-rose-500 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(244,63,94,0.5)] bg-background/80 backdrop-blur-sm">Banned</span>
                      </div>
                    )}
                    {isBluePick && (
                      <div className="absolute inset-0 bg-blue-500/10 z-20 flex items-end justify-end p-2">
                        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Blue</span>
                      </div>
                    )}
                    {isRedPick && (
                      <div className="absolute inset-0 bg-red-500/10 z-20 flex items-end justify-end p-2">
                        <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Red</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DRAFT COMPLETE ── */}
        {phase === "complete" && winAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            {/* ── Overall Win Probability ── */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Draft Win Probability
              </h2>

              {/* Team labels + percentages */}
              <div className="flex justify-between items-end mb-3">
                <div className="text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-1">Blue Team</span>
                  <span
                    className="font-black text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]"
                    style={{ fontSize: "clamp(2rem,6vw,3.5rem)", lineHeight: 1 }}
                  >
                    {winAnalysis.overallBlueWinPct}%
                  </span>
                </div>
                <div className="text-center px-4">
                  <span className="text-2xl font-black text-muted-foreground/30">VS</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400 block mb-1">Red Team</span>
                  <span
                    className="font-black text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                    style={{ fontSize: "clamp(2rem,6vw,3.5rem)", lineHeight: 1 }}
                  >
                    {100 - winAnalysis.overallBlueWinPct}%
                  </span>
                </div>
              </div>

              {/* Tug-of-war bar */}
              <div className="relative h-5 rounded-full overflow-hidden bg-muted flex">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-l-full"
                  initial={{ width: "50%" }}
                  animate={{ width: `${winAnalysis.overallBlueWinPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 rounded-r-full flex-1"
                  initial={{ width: "50%" }}
                  animate={{ width: `${100 - winAnalysis.overallBlueWinPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                {/* Center tick */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-background/60" />
              </div>

              {/* Verdict label */}
              <div className="mt-4 text-center">
                {winAnalysis.overallBlueWinPct >= 58 && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-4 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" /> Blue Team Draft Advantage
                  </span>
                )}
                {winAnalysis.overallBlueWinPct <= 42 && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-4 py-1.5 rounded-full">
                    <TrendingDown className="w-4 h-4" /> Red Team Draft Advantage
                  </span>
                )}
                {winAnalysis.overallBlueWinPct > 42 && winAnalysis.overallBlueWinPct < 58 && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full">
                    <Minus className="w-4 h-4" /> Even Draft — Skill Will Decide
                  </span>
                )}
              </div>
            </div>

            {/* ── Lane Matchup Breakdown ── */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Lane Matchup Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {winAnalysis.lanes.map((lane) => {
                  const blueWin  = lane.blueWinPct;
                  const redWin   = 100 - blueWin;
                  const verdict  = blueWin >= 58 ? "blue" : blueWin <= 42 ? "red" : "even";
                  const blueB    = BRAWLERS[lane.blueBrawler];
                  const redB     = BRAWLERS[lane.redBrawler];

                  return (
                    <motion.div
                      key={lane.lane}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: lane.lane * 0.12, duration: 0.45 }}
                      className={`bg-card rounded-xl border overflow-hidden ${
                        verdict === "blue" ? "border-blue-500/40" :
                        verdict === "red"  ? "border-red-500/40"  :
                                             "border-amber-400/30"
                      }`}
                    >
                      {/* Lane header */}
                      <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest ${
                        verdict === "blue" ? "bg-blue-500/10 text-blue-400" :
                        verdict === "red"  ? "bg-red-500/10  text-red-400"  :
                                             "bg-amber-400/10 text-amber-400"
                      }`}>
                        <span>Lane {lane.lane}</span>
                        <span className="flex items-center gap-1">
                          {verdict === "blue" && <><TrendingUp className="w-3 h-3" /> Blue Favored</>}
                          {verdict === "red"  && <><TrendingDown className="w-3 h-3" /> Red Favored</>}
                          {verdict === "even" && <><Minus className="w-3 h-3" /> Even</>}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col gap-4">
                        {/* Brawler matchup row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Blue brawler */}
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <div className={`p-2 rounded-lg border ${getRoleBg(blueB.role)}`}>
                              <RoleIcon role={blueB.role} className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-center leading-tight">{lane.blueBrawler}</span>
                            <span className={`text-xs font-semibold ${getRoleColor(blueB.role)}`}>{blueB.role}</span>
                          </div>

                          <span className="text-xs font-black text-muted-foreground/40 px-1">VS</span>

                          {/* Red brawler */}
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <div className={`p-2 rounded-lg border ${getRoleBg(redB.role)}`}>
                              <RoleIcon role={redB.role} className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-center leading-tight">{lane.redBrawler}</span>
                            <span className={`text-xs font-semibold ${getRoleColor(redB.role)}`}>{redB.role}</span>
                          </div>
                        </div>

                        {/* Win% bar */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-blue-400">{blueWin}%</span>
                            <span className="text-red-400">{redWin}%</span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden bg-muted flex">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                              initial={{ width: "50%" }}
                              animate={{ width: `${blueWin}%` }}
                              transition={{ delay: lane.lane * 0.12 + 0.3, duration: 0.9, ease: "easeOut" }}
                            />
                            <motion.div
                              className="h-full bg-gradient-to-l from-red-600 to-red-400 flex-1"
                              initial={{ width: "50%" }}
                              animate={{ width: `${redWin}%` }}
                              transition={{ delay: lane.lane * 0.12 + 0.3, duration: 0.9, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        {/* Key factors */}
                        {lane.factors.length > 0 && (
                          <div className="flex flex-col gap-1 pt-1 border-t border-border/40">
                            {lane.factors.map((f, i) => (
                              <span key={i} className="text-xs text-muted-foreground leading-snug">
                                • {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Team Composition Summary ── */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-gradient-to-br from-blue-950/40 to-background border border-blue-900/50 rounded-xl p-6">
                <h2 className="text-xl font-black text-blue-400 mb-5 uppercase tracking-wider text-center drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  Blue Team
                </h2>
                <div className="flex flex-col gap-3">
                  {bluePicks.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-background/50 border border-blue-900/30 p-3 rounded-lg">
                      <RoleIcon role={BRAWLERS[p].role} className={`w-5 h-5 flex-shrink-0 ${getRoleColor(BRAWLERS[p].role)}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-base font-bold block">{p}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">{BRAWLERS[p].role}</span>
                      </div>
                      <span className="text-blue-400 font-black text-sm ml-auto">
                        {winAnalysis.lanes[i]?.blueWinPct ?? "—"}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center font-black text-4xl text-muted-foreground/20 px-2">VS</div>

              <div className="flex-1 bg-gradient-to-br from-red-950/40 to-background border border-red-900/50 rounded-xl p-6">
                <h2 className="text-xl font-black text-red-400 mb-5 uppercase tracking-wider text-center drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  Red Team
                </h2>
                <div className="flex flex-col gap-3">
                  {redPicks.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-background/50 border border-red-900/30 p-3 rounded-lg">
                      <RoleIcon role={BRAWLERS[p].role} className={`w-5 h-5 flex-shrink-0 ${getRoleColor(BRAWLERS[p].role)}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-base font-bold block">{p}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">{BRAWLERS[p].role}</span>
                      </div>
                      <span className="text-red-400 font-black text-sm ml-auto">
                        {winAnalysis.lanes[i] ? (100 - winAnalysis.lanes[i].blueWinPct) : "—"}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
