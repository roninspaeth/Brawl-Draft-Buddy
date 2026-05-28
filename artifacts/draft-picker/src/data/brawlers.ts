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

export interface Brawler {
  role: Role;
  range: Range;
  mapTags: MapTag[];
  counters: string[];
}

export const BRAWLERS: Record<string, Brawler> = {
  // ── Tanks ─────────────────────────────────────────────────────────────────
  "Bull":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Belle", "Colt"] },
  "Frank":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock", "Mandy"] },
  "Rosa":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Colt"] },
  "El Primo":       { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Mandy"] },
  "Darryl":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed", "lane"], counters: ["Piper", "Belle", "Brock"] },
  "Jacky":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Colt"] },
  "Ash":            { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Belle"] },
  "Sam":            { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Edgar", "Mortis", "Fang"] },
  "Buster":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed", "lane"], counters: ["Piper", "Brock", "Belle"] },
  "Hank":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"] },
  "Draco":          { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Brock", "Mandy"] },
  "R-T":            { role: "Tank",          range: "Short",  mapTags: ["lane", "closed"],               counters: ["Piper", "Brock", "Belle"] },
  "Damian":         { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "closed"],         counters: ["Piper", "Belle", "Brock"] },
  "Nita":           { role: "Tank",          range: "Medium", mapTags: ["open", "bush-heavy"],           counters: ["Piper", "Brock", "Belle"] },
  "Bibi":           { role: "Tank",          range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Colt"] },

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
  "Piper":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang", "Bull"] },
  "Colt":           { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"] },
  "Brock":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang"] },
  "Belle":          { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Crow", "Stu", "Leon"] },
  "Bea":            { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Fang"] },
  "Nani":           { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Bull", "Frank", "Rosa", "El Primo"] },
  "Janet":          { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Leon", "Edgar"] },
  "Mandy":          { role: "Marksman",      range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"] },
  "Maisie":         { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Leon", "Fang", "Edgar"] },
  "Angelo":         { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Leon", "Bull"] },
  "Mina":           { role: "Marksman",      range: "Long",   mapTags: ["open"],                         counters: ["Mortis", "Edgar", "Bull"] },

  // ── Support ───────────────────────────────────────────────────────────────
  "Poco":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon", "Fang"] },
  "Pam":            { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang", "Melodie"] },
  "Byron":          { role: "Support",       range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Gene":           { role: "Support",       range: "Long",   mapTags: ["open", "lane"],                 counters: ["Leon", "Mortis", "Lily"] },
  "Gus":            { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Doug":           { role: "Support",       range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Fang"] },
  "Max":            { role: "Support",       range: "Medium", mapTags: ["open", "lane"],                 counters: ["Piper", "Belle", "Brock"] },
  "Juju":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Berry":          { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Kit":            { role: "Support",       range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Belle"] },
  "Gray":           { role: "Support",       range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Colonel Ruffs":  { role: "Support",       range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },

  // ── Damage Dealers ────────────────────────────────────────────────────────
  "Shelly":         { role: "Damage Dealer", range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Fang"] },
  "Jessie":         { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Bo":             { role: "Damage Dealer", range: "Medium", mapTags: ["open", "bush-heavy"],           counters: ["Piper", "Belle", "Brock"] },
  "8-Bit":          { role: "Damage Dealer", range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
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
  "Chuck":          { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Gadget":         { role: "Damage Dealer", range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },
  "Pearl":          { role: "Damage Dealer", range: "Short",  mapTags: ["closed", "bush-heavy"],         counters: ["Piper", "Brock", "Belle"] },
  "Emz":            { role: "Damage Dealer", range: "Medium", mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Fang"] },

  // ── Artillery ─────────────────────────────────────────────────────────────
  "Dynamike":       { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Crow", "Edgar", "Leon"] },
  "Barley":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Leon"] },
  "Tick":           { role: "Artillery",     range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Leon", "Edgar"] },
  "Grom":           { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Bull", "Frank", "El Primo", "Rosa"] },
  "Sprout":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Edgar", "Leon"] },
  "Squeak":         { role: "Artillery",     range: "Long",   mapTags: ["closed", "bush-heavy"],         counters: ["Mortis", "Edgar", "Leon"] },
  "Penny":          { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Bonnie":         { role: "Artillery",     range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },

  // ── Controllers ───────────────────────────────────────────────────────────
  "Rico":           { role: "Controller",    range: "Long",   mapTags: ["closed", "lane"],               counters: ["Mortis", "Edgar", "Leon"] },
  "Tara":           { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Leon", "Mortis", "Lily"] },
  "Sandy":          { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Spike":          { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Leon"] },
  "Lou":            { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Willow":         { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Leon"] },
  "Amber":          { role: "Controller",    range: "Medium", mapTags: ["lane", "open"],                 counters: ["Mortis", "Edgar", "Fang"] },
  "Otis":           { role: "Controller",    range: "Medium", mapTags: ["lane", "closed"],               counters: ["Mortis", "Edgar", "Leon"] },
  "Charlie":        { role: "Controller",    range: "Medium", mapTags: ["bush-heavy", "lane"],           counters: ["Mortis", "Edgar", "Leon"] },
  "Sirius":         { role: "Controller",    range: "Long",   mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Bull"] },
  "Gale":           { role: "Controller",    range: "Medium", mapTags: ["open", "lane"],                 counters: ["Mortis", "Edgar", "Fang"] },

  // ── Hybrids ───────────────────────────────────────────────────────────────
  "Buzz":           { role: "Hybrid",        range: "Short",  mapTags: ["bush-heavy", "lane"],           counters: ["Piper", "Brock", "Belle"] },
};
