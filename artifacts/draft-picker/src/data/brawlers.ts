export type Role =
  | "Tank"
  | "Assassin"
  | "Marksman"
  | "Support"
  | "Damage Dealer"
  | "Artillery"
  | "Controller"
  | "Hybrid";

export type Range = "Short" | "Medium" | "Long";
export type MapTag = "open" | "closed" | "bush-heavy" | "lane";

export type SpecialtyTag =
  | "heist-specialist"
  | "goal-scorer"
  | "gem-carrier"
  | "bounty-specialist"
  | "zone-control";

export interface Brawler {
  role: Role;
  range: Range;
  mapTags: MapTag[];
  counters: string[];
  specialtyTags?: SpecialtyTag[];
}

// Which mode activates which specialty tag
export const MODE_SPECIALTY: Record<string, SpecialtyTag> = {
  "Heist":     "heist-specialist",
  "Brawl Ball":"goal-scorer",
  "Gem Grab":  "gem-carrier",
  "Bounty":    "bounty-specialist",
  "Hot Zone":  "zone-control",
};

export const SPECIALTY_LABEL: Record<SpecialtyTag, string> = {
  "heist-specialist": "Heist Specialist",
  "goal-scorer":      "Goal Scorer",
  "gem-carrier":      "Gem Carrier",
  "bounty-specialist":"Bounty Specialist",
  "zone-control":     "Zone Control",
};

export const BRAWLERS: Record<string, Brawler> = {
  // ── Tanks ─────────────────────────────────────────────────────────────────
  "Bull":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Belle", "Colt"],      specialtyTags: ["heist-specialist", "goal-scorer", "gem-carrier"] },
  "Frank":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock", "Mandy"],     specialtyTags: ["goal-scorer", "gem-carrier"] },
  "Rosa":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Colt"],               specialtyTags: ["gem-carrier"] },
  "El Primo":       { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Mandy"],              specialtyTags: ["goal-scorer", "gem-carrier"] },
  "Darryl":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed", "lane"], counters: ["Piper", "Belle", "Brock"],              specialtyTags: ["heist-specialist", "gem-carrier"] },
  "Jacky":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Colt"],               specialtyTags: ["gem-carrier"] },
  "Ash":            { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Belle"],              specialtyTags: ["gem-carrier"] },
  "Sam":            { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Edgar", "Mortis", "Fang"],              specialtyTags: ["gem-carrier"] },
  "Buster":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed", "lane"], counters: ["Piper", "Brock", "Belle"],              specialtyTags: ["gem-carrier"] },
  "Hank":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"],              specialtyTags: ["gem-carrier"] },
  "Draco":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Mandy"],              specialtyTags: ["gem-carrier"] },
  "R-T":            { role: "Tank",          range: "Short",  mapTags: ["lane", "closed"],               counters: ["Piper", "Brock", "Belle"],              specialtyTags: ["gem-carrier"] },
  "Damian":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"],              specialtyTags: ["gem-carrier"] },
  "Nita":           { role: "Tank",          range: "Medium", mapTags: ["open", "bush-heavy"],           counters: ["Piper", "Brock", "Belle"],              specialtyTags: ["gem-carrier"] },
  "Bibi":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Colt"],               specialtyTags: ["goal-scorer", "gem-carrier"] },

  // ── Assassins ─────────────────────────────────────────────────────────────
  "Mortis":         { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Poco", "Pam", "Frank", "Rosa", "Tara"] },
  "Edgar":          { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Poco", "Pam", "Frank", "Berry"] },
  "Leon":           { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Tara", "Gene", "Spike"] },
  "Fang":           { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Pam", "Frank", "Poco", "Berry"] },
  "Mico":           { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Pam", "Poco", "Frank"] },
  "Cordelius":      { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy"],                   counters: ["Piper", "Belle", "Brock", "Maisie"] },
  "Melodie":        { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Pam", "Frank", "Poco"] },
  "Lily":           { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy"],                   counters: ["Piper", "Brock", "Belle"] },
  "Moe":            { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"] },
  "Kenji":          { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Pam", "Poco", "Frank"] },
  "Kaze":           { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy"],                   counters: ["Piper", "Brock", "Belle"] },
  "Najia":          { role: "Assassin",      range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"] },
  "Stu":            { role: "Assassin",      range: "Medium", mapTags: ["open", "lane"],                 counters: ["Piper", "Brock", "Belle"] },
  "Crow":           { role: "Assassin",      range: "Medium", mapTags: ["open", "bush-heavy"],           counters: ["Bull", "Frank", "El Primo"] },
  "BOLT":           { role: "Assassin",      range: "Short",  mapTags: ["open", "lane"],                 counters: ["Piper", "Brock", "Belle"] },

  // ── Marksmen ──────────────────────────────────────────────────────────────
  "Piper":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang", "Bull"],   specialtyTags: ["bounty-specialist"] },
  "Colt":           { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"],          specialtyTags: ["heist-specialist", "bounty-specialist"] },
  "Brock":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang"],            specialtyTags: ["heist-specialist", "bounty-specialist"] },
  "Belle":          { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Crow", "Stu", "Leon"],              specialtyTags: ["bounty-specialist"] },
  "Bea":            { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang"],            specialtyTags: ["bounty-specialist"] },
  "Nani":           { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Bull", "Frank", "Rosa", "El Primo"],          specialtyTags: ["bounty-specialist"] },
  "Janet":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Leon", "Edgar"],                    specialtyTags: ["bounty-specialist"] },
  "Mandy":          { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"],          specialtyTags: ["bounty-specialist"] },
  "Maisie":         { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Leon", "Fang", "Edgar"],            specialtyTags: ["bounty-specialist"] },
  "Angelo":         { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Bull"],            specialtyTags: ["bounty-specialist"] },
  "Mina":           { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Bull"],                    specialtyTags: ["bounty-specialist"] },

  // ── Support ───────────────────────────────────────────────────────────────
  "Poco":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon", "Fang"],            specialtyTags: ["gem-carrier"] },
  "Pam":            { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang", "Melodie"],         specialtyTags: ["gem-carrier", "zone-control"] },
  "Byron":          { role: "Support",       range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["gem-carrier", "bounty-specialist"] },
  "Gene":           { role: "Support",       range: "Long",   mapTags: ["open", "lane"],                 counters: ["Leon", "Mortis", "Lily"],                     specialtyTags: ["gem-carrier", "bounty-specialist"] },
  "Gus":            { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["gem-carrier"] },
  "Doug":           { role: "Support",       range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Fang"],                    specialtyTags: ["gem-carrier"] },
  "Max":            { role: "Support",       range: "Medium", mapTags: ["open", "lane"],                 counters: ["Piper", "Belle", "Brock"],                    specialtyTags: ["gem-carrier"] },
  "Juju":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["gem-carrier"] },
  "Berry":          { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang"],                    specialtyTags: ["gem-carrier"] },
  "Kit":            { role: "Support",       range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Belle"],                    specialtyTags: ["gem-carrier"] },
  "Gray":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["gem-carrier"] },
  "Colonel Ruffs":  { role: "Support",       range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"],                    specialtyTags: ["gem-carrier"] },

  // ── Damage Dealers ────────────────────────────────────────────────────────
  "Shelly":         { role: "Damage Dealer", range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Fang"] },
  "Jessie":         { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Bo":             { role: "Damage Dealer", range: "Medium", mapTags: ["open", "bush-heavy"],           counters: ["Piper", "Belle", "Brock"] },
  "8-Bit":          { role: "Damage Dealer", range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist"] },
  "Griff":          { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"] },
  "Colette":        { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "Rosa", "El Primo"] },
  "Meg":            { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Lola":           { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Eve":            { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Chester":        { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Larry & Lawrie": { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Clancy":         { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Ziggy":          { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Pine":           { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Carl":           { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Surge":          { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },
  "Mr. P":          { role: "Damage Dealer", range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Chuck":          { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"],                    specialtyTags: ["heist-specialist"] },
  "Gadget":         { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },
  "Pearl":          { role: "Damage Dealer", range: "Short",  mapTags: ["closed", "bush-heavy"],         counters: ["Piper", "Brock", "Belle"] },
  "Emz":            { role: "Damage Dealer", range: "Medium", mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Fang"] },

  // ── Artillery ─────────────────────────────────────────────────────────────
  "Dynamike":       { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Crow", "Edgar", "Leon"],            specialtyTags: ["heist-specialist", "bounty-specialist"] },
  "Barley":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist"] },
  "Tick":           { role: "Artillery",     range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Leon", "Edgar"],                    specialtyTags: ["heist-specialist", "bounty-specialist"] },
  "Grom":           { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"],          specialtyTags: ["bounty-specialist"] },
  "Sprout":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist", "zone-control"] },
  "Squeak":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist"] },
  "Penny":          { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist"] },
  "Bonnie":         { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"],                    specialtyTags: ["bounty-specialist"] },

  // ── Controllers ───────────────────────────────────────────────────────────
  "Rico":           { role: "Controller",    range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Edgar", "Leon"],                    specialtyTags: ["bounty-specialist"] },
  "Tara":           { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Leon", "Mortis", "Lily"] },
  "Sandy":          { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Spike":          { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Lou":            { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Willow":         { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Leon"] },
  "Amber":          { role: "Controller",    range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang"],                    specialtyTags: ["zone-control"] },
  "Otis":           { role: "Controller",    range: "Medium", mapTags: ["lane", "closed"],               counters: ["Mortis", "Edgar", "Leon"] },
  "Charlie":        { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Leon"] },
  "Sirius":         { role: "Controller",    range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"],                    specialtyTags: ["bounty-specialist"] },
  "Gale":           { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"],                    specialtyTags: ["zone-control"] },

  // ── Hybrids ───────────────────────────────────────────────────────────────
  "Buzz":           { role: "Hybrid",        range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Belle"],                    specialtyTags: ["gem-carrier"] },
};
