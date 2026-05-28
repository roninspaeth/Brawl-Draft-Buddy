import type { MapTag, Role } from "./brawlers";

export interface GameMap {
  name: string;
  mode: string;
  tags: MapTag[];
  strongRoles: Role[];
  label: string;
}

export const MAPS: GameMap[] = [
  // ── Gem Grab ──────────────────────────────────────────────────────────────
  {
    name: "Hard Rock Mine",
    mode: "Gem Grab",
    tags: ["closed", "lane"],
    strongRoles: ["Controller", "Artillery", "Support", "Tank"],
    label: "Closed lanes, wall-heavy",
  },
  {
    name: "Undermine",
    mode: "Gem Grab",
    tags: ["closed", "lane"],
    strongRoles: ["Controller", "Artillery", "Support"],
    label: "Tight corridors, mine control",
  },
  {
    name: "Double Swoosh",
    mode: "Gem Grab",
    tags: ["open", "lane"],
    strongRoles: ["Marksman", "Damage Dealer", "Support", "Controller"],
    label: "Semi-open, mid-range fights",
  },
  {
    name: "Minecart Madness",
    mode: "Gem Grab",
    tags: ["open", "lane"],
    strongRoles: ["Marksman", "Damage Dealer", "Controller", "Support"],
    label: "Open lanes, objective-focused",
  },

  // ── Brawl Ball ────────────────────────────────────────────────────────────
  {
    name: "Backyard Bowl",
    mode: "Brawl Ball",
    tags: ["open", "lane"],
    strongRoles: ["Tank", "Support", "Damage Dealer"],
    label: "Open field, goal push",
  },
  {
    name: "Super Beach",
    mode: "Brawl Ball",
    tags: ["open"],
    strongRoles: ["Tank", "Marksman", "Damage Dealer"],
    label: "Very open, long sightlines",
  },
  {
    name: "GG Corral",
    mode: "Brawl Ball",
    tags: ["lane", "bush-heavy"],
    strongRoles: ["Tank", "Assassin", "Support"],
    label: "Bushy sides, lane-based",
  },
  {
    name: "Center Stage",
    mode: "Brawl Ball",
    tags: ["open"],
    strongRoles: ["Tank", "Damage Dealer", "Support"],
    label: "Open center, goal rushes",
  },

  // ── Knockout ──────────────────────────────────────────────────────────────
  {
    name: "Goldarm Gulch",
    mode: "Knockout",
    tags: ["open"],
    strongRoles: ["Marksman", "Artillery", "Damage Dealer"],
    label: "Very open, sniper paradise",
  },
  {
    name: "New Horizons",
    mode: "Knockout",
    tags: ["open"],
    strongRoles: ["Marksman", "Damage Dealer", "Controller"],
    label: "Open map, mid-range brawling",
  },
  {
    name: "Flowing Springs",
    mode: "Knockout",
    tags: ["bush-heavy", "lane"],
    strongRoles: ["Assassin", "Tank", "Controller"],
    label: "Bush-heavy, close quarters",
  },
  {
    name: "Flaring Phoenix",
    mode: "Knockout",
    tags: ["open", "lane"],
    strongRoles: ["Marksman", "Damage Dealer", "Artillery"],
    label: "Open with lanes, versatile",
  },

  // ── Heist ─────────────────────────────────────────────────────────────────
  {
    name: "Safe Zone",
    mode: "Heist",
    tags: ["open", "lane"],
    strongRoles: ["Damage Dealer", "Marksman", "Artillery"],
    label: "Open approach, safe cracking",
  },
  {
    name: "Kaboom Canyon",
    mode: "Heist",
    tags: ["closed", "lane"],
    strongRoles: ["Tank", "Damage Dealer", "Artillery"],
    label: "Narrow lanes, heavy damage",
  },
  {
    name: "Hot Potato",
    mode: "Heist",
    tags: ["closed", "bush-heavy"],
    strongRoles: ["Tank", "Assassin", "Damage Dealer"],
    label: "Tight & bushy, close-range",
  },
  {
    name: "Bridge Too Far",
    mode: "Heist",
    tags: ["open", "lane"],
    strongRoles: ["Artillery", "Marksman", "Damage Dealer"],
    label: "Long bridge, range advantage",
  },

  // ── Bounty ────────────────────────────────────────────────────────────────
  {
    name: "Shooting Star",
    mode: "Bounty",
    tags: ["open"],
    strongRoles: ["Marksman", "Artillery", "Controller"],
    label: "Classic open Bounty map",
  },
  {
    name: "Layer Cake",
    mode: "Bounty",
    tags: ["closed", "lane"],
    strongRoles: ["Controller", "Artillery", "Damage Dealer"],
    label: "Wall-heavy, tiered layout",
  },
  {
    name: "Canal Grande",
    mode: "Bounty",
    tags: ["open", "lane"],
    strongRoles: ["Marksman", "Damage Dealer", "Controller"],
    label: "Open lanes, star collection",
  },
  {
    name: "Snake Prairie",
    mode: "Bounty",
    tags: ["bush-heavy"],
    strongRoles: ["Assassin", "Tank", "Controller"],
    label: "Heavy bush, ambush-friendly",
  },

  // ── Hot Zone ──────────────────────────────────────────────────────────────
  {
    name: "Open Business",
    mode: "Hot Zone",
    tags: ["open"],
    strongRoles: ["Controller", "Marksman", "Support"],
    label: "Wide open zones, area control",
  },
  {
    name: "Ring of Fire",
    mode: "Hot Zone",
    tags: ["open", "lane"],
    strongRoles: ["Controller", "Damage Dealer", "Support"],
    label: "Open zone, sustained fights",
  },
  {
    name: "Dueling Beetles",
    mode: "Hot Zone",
    tags: ["bush-heavy", "lane"],
    strongRoles: ["Controller", "Tank", "Assassin"],
    label: "Bushy flanks, zone fights",
  },
  {
    name: "Parallel Plays",
    mode: "Hot Zone",
    tags: ["open", "lane"],
    strongRoles: ["Controller", "Marksman", "Damage Dealer"],
    label: "Parallel lanes, zone holding",
  },
];

export const MODES = [...new Set(MAPS.map((m) => m.mode))];
