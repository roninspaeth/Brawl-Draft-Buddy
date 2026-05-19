"""
Brawl Stars Ranked Draft Picker Assistant
==========================================
Guides you through the official ranked pick sequence:
  1. Blue picks 1  (Blue 1)
  2. Red picks 2   (Red 1, Red 2)
  3. Blue picks 2  (Blue 2, Blue 3)
  4. Red picks 1   (Red 3)

At each step the system scores every available Brawler and shows the top 3
recommendations for the active team, along with a short explanation.
"""

from __future__ import annotations

import sys
from typing import Optional

# ---------------------------------------------------------------------------
# DATA: Brawlers
# ---------------------------------------------------------------------------

# Each entry: name -> {role, best_maps (archetypes), counters (brawler names)}
BRAWLERS: dict[str, dict] = {
    # Marksmen
    "Piper": {
        "role": "Marksman",
        "best_maps": ["Wide Open / Long Range", "Balanced / Mid Range"],
        "counters": ["Mortis", "Edgar", "Leon"],
    },
    "Colt": {
        "role": "Marksman",
        "best_maps": ["Wide Open / Long Range", "High DPS / Base Race"],
        "counters": ["Frank", "Rosa", "Bull"],
    },
    "Brock": {
        "role": "Marksman",
        "best_maps": ["Wide Open / Long Range", "Wall Heavy / Split Lanes"],
        "counters": ["Mortis", "Edgar"],
    },
    "Belle": {
        "role": "Marksman",
        "best_maps": ["Wide Open / Long Range", "Balanced / Mid Range"],
        "counters": ["Mortis", "Crow"],
    },
    # Artillery
    "Dynamike": {
        "role": "Artillery",
        "best_maps": ["Wall Heavy / Split Lanes", "High Bush / Close Range"],
        "counters": ["Mortis", "Crow", "Edgar"],
    },
    "Tick": {
        "role": "Artillery",
        "best_maps": ["Wall Heavy / Split Lanes", "Balanced / Mid Range"],
        "counters": ["Mortis", "Leon"],
    },
    "Barley": {
        "role": "Artillery",
        "best_maps": ["Wall Heavy / Split Lanes", "High Bush / Close Range"],
        "counters": ["Mortis", "Edgar"],
    },
    # Controllers
    "Gene": {
        "role": "Controller",
        "best_maps": ["Balanced / Mid Range", "Wall Heavy / Split Lanes"],
        "counters": ["Piper", "Brock"],
    },
    "Max": {
        "role": "Controller",
        "best_maps": ["Balanced / Mid Range", "High Bush / Close Range"],
        "counters": ["Piper", "Belle"],
    },
    "Colette": {
        "role": "Controller",
        "best_maps": ["Balanced / Mid Range", "High DPS / Base Race"],
        "counters": ["Frank", "Bull", "Rosa"],
    },
    # Assassins
    "Mortis": {
        "role": "Assassin",
        "best_maps": ["High Bush / Close Range", "Balanced / Mid Range"],
        "counters": ["Frank", "Rosa", "Poco"],
    },
    "Edgar": {
        "role": "Assassin",
        "best_maps": ["High Bush / Close Range", "Wall Heavy / Split Lanes"],
        "counters": ["Frank", "Poco", "Pam"],
    },
    "Leon": {
        "role": "Assassin",
        "best_maps": ["High Bush / Close Range", "Balanced / Mid Range"],
        "counters": ["Gene", "Tara"],
    },
    "Crow": {
        "role": "Assassin",
        "best_maps": ["Wide Open / Long Range", "Balanced / Mid Range"],
        "counters": ["Frank", "Bull"],
    },
    # Tanks
    "Frank": {
        "role": "Tank",
        "best_maps": ["High Bush / Close Range", "High DPS / Base Race"],
        "counters": ["Piper", "Brock", "Colt"],
    },
    "Bull": {
        "role": "Tank",
        "best_maps": ["High Bush / Close Range", "High DPS / Base Race"],
        "counters": ["Piper", "Belle", "Colt"],
    },
    "Rosa": {
        "role": "Tank",
        "best_maps": ["High Bush / Close Range", "Wall Heavy / Split Lanes"],
        "counters": ["Piper", "Brock"],
    },
    "Rico": {
        "role": "Controller",  # unique: walls = his domain
        "best_maps": ["Wall Heavy / Split Lanes", "High DPS / Base Race"],
        "counters": ["Mortis", "Edgar"],
    },
    "Spike": {
        "role": "Controller",
        "best_maps": ["Wide Open / Long Range", "Balanced / Mid Range"],
        "counters": ["Mortis", "Edgar"],
    },
    "Tara": {
        "role": "Controller",
        "best_maps": ["Balanced / Mid Range", "High Bush / Close Range"],
        "counters": ["Leon", "Mortis"],
    },
}

# ---------------------------------------------------------------------------
# DATA: Maps
# ---------------------------------------------------------------------------

# Each map: name -> {mode, archetype}
MAPS: dict[str, dict] = {
    "Shooting Star": {
        "mode": "Bounty",
        "archetype": "Wide Open / Long Range",
    },
    "Snake Prairie": {
        "mode": "Bounty",
        "archetype": "High Bush / Close Range",
    },
    "Split": {
        "mode": "Hot Zone",
        "archetype": "Wall Heavy / Split Lanes",
    },
    "Brawl Ball Meta Map": {
        "mode": "Brawl Ball",
        "archetype": "Balanced / Mid Range",
    },
    "Safe Zone": {
        "mode": "Heist",
        "archetype": "High DPS / Base Race",
    },
}

# Map archetype -> roles that thrive there (used for Map Synergy scoring)
ARCHETYPE_ROLES: dict[str, list[str]] = {
    "Wide Open / Long Range": ["Marksman"],
    "High Bush / Close Range": ["Assassin", "Tank"],
    "Wall Heavy / Split Lanes": ["Artillery", "Controller"],
    "Balanced / Mid Range": ["Controller", "Marksman", "Assassin"],
    "High DPS / Base Race": ["Tank", "Controller", "Marksman"],
}

# Role composition balance guidelines:
# If the team already has X of these roles, prefer others.
SQUISHY_ROLES = {"Marksman", "Assassin", "Artillery"}
STURDY_ROLES = {"Tank", "Controller"}

# ---------------------------------------------------------------------------
# DRAFT SEQUENCE
# ---------------------------------------------------------------------------

DRAFT_ORDER: list[tuple[str, int]] = [
    ("Blue", 1),   # Blue 1
    ("Red", 1),    # Red 1
    ("Red", 1),    # Red 2
    ("Blue", 1),   # Blue 2
    ("Blue", 1),   # Blue 3
    ("Red", 1),    # Red 3
]

# ---------------------------------------------------------------------------
# SCORING ENGINE
# ---------------------------------------------------------------------------

def score_brawler(
    brawler_name: str,
    map_archetype: str,
    my_picks: list[str],
    enemy_picks: list[str],
) -> tuple[int, list[str]]:
    """
    Score a single Brawler for the current pick slot.

    Breakdown:
      +40  Map Synergy  — brawler role fits map archetype
      +20  Team Comp    — helps balance the team composition
      +30  Counter-pick — counters one or more locked enemy picks
      -40  Counter-risk — a locked enemy pick hard counters this brawler

    Returns (total_score, [list of reason strings])
    """
    data = BRAWLERS[brawler_name]
    role = data["role"]
    reasons: list[str] = []
    score = 0

    # --- Map Synergy (+40) ---
    preferred_roles = ARCHETYPE_ROLES.get(map_archetype, [])
    if role in preferred_roles:
        score += 40
        reasons.append(f"Excellent map synergy ({role} on {map_archetype})")

    # --- Team Composition Balance (+20) ---
    my_roles = [BRAWLERS[b]["role"] for b in my_picks if b in BRAWLERS]
    squishy_count = sum(1 for r in my_roles if r in SQUISHY_ROLES)
    sturdy_count = sum(1 for r in my_roles if r in STURDY_ROLES)

    if squishy_count >= 2 and role in STURDY_ROLES:
        score += 20
        reasons.append("Balances team (adds durability to a squishy lineup)")
    elif sturdy_count >= 2 and role in SQUISHY_ROLES:
        score += 20
        reasons.append("Balances team (adds damage to a tanky lineup)")
    elif squishy_count < 2 and sturdy_count < 2:
        # First or second pick — any well-rounded role gets the bonus
        score += 10
        reasons.append("Good early-draft pick for flexible composition")

    # --- Counter-Picking (+30 per countered enemy, up to 30 total) ---
    brawler_counters = [c.lower() for c in data["counters"]]
    enemy_lower = [e.lower() for e in enemy_picks]
    countered_enemies = [e for e in enemy_lower if e in brawler_counters]
    if countered_enemies:
        score += 30
        countered_display = ", ".join(e.title() for e in countered_enemies)
        reasons.append(f"Hard counters locked enemy pick(s): {countered_display}")

    # --- Counter-Risk (-40 if an enemy counters this brawler) ---
    for enemy_name in enemy_picks:
        if enemy_name not in BRAWLERS:
            continue
        enemy_counters = [c.lower() for c in BRAWLERS[enemy_name]["counters"]]
        if brawler_name.lower() in enemy_counters:
            score -= 40
            reasons.append(
                f"Risky: {enemy_name} (enemy) hard counters {brawler_name}"
            )
            break  # One penalty is enough

    if not reasons:
        reasons.append("Solid general-purpose pick")

    return score, reasons


def get_top_recommendations(
    available: list[str],
    map_archetype: str,
    my_picks: list[str],
    enemy_picks: list[str],
    top_n: int = 3,
) -> list[tuple[str, int, list[str]]]:
    """Return the top N (brawler_name, score, reasons) tuples, sorted by score."""
    scored = []
    for name in available:
        score, reasons = score_brawler(name, map_archetype, my_picks, enemy_picks)
        scored.append((name, score, reasons))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_n]


# ---------------------------------------------------------------------------
# INPUT HELPERS
# ---------------------------------------------------------------------------

def normalise(name: str) -> str:
    """Lowercase + strip for case-insensitive matching."""
    return name.strip().lower()


def find_brawler(name: str, pool: list[str]) -> Optional[str]:
    """
    Return the canonical Brawler name from pool if found (case-insensitive),
    else None.
    """
    target = normalise(name)
    for b in pool:
        if normalise(b) == target:
            return b
    return None


def prompt_map() -> tuple[str, str]:
    """Interactively ask the user to choose a map. Returns (map_name, archetype)."""
    map_list = list(MAPS.keys())
    print("\n" + "=" * 55)
    print("  SELECT MAP")
    print("=" * 55)
    for i, name in enumerate(map_list, 1):
        m = MAPS[name]
        print(f"  {i}. {name}  [{m['mode']}]  —  {m['archetype']}")
    print()

    while True:
        raw = input("Enter map number or name: ").strip()
        # Try numeric
        if raw.isdigit():
            idx = int(raw) - 1
            if 0 <= idx < len(map_list):
                chosen = map_list[idx]
                return chosen, MAPS[chosen]["archetype"]
        # Try name
        matched = find_brawler(raw, map_list)
        if matched:
            return matched, MAPS[matched]["archetype"]
        print(f"  [!] '{raw}' not recognised. Try again.")


def prompt_bans(available: list[str]) -> list[str]:
    """Ask for 0-4 bans. Returns list of banned Brawler names."""
    print("\n" + "=" * 55)
    print("  BAN PHASE  (enter up to 4 Brawler names, blank to skip)")
    print("=" * 55)
    banned: list[str] = []
    for slot in range(1, 5):
        raw = input(f"  Ban {slot} (or press Enter to finish): ").strip()
        if not raw:
            break
        match = find_brawler(raw, available)
        if match:
            banned.append(match)
            available.remove(match)
            print(f"  ✓  {match} banned.")
        else:
            print(f"  [!] '{raw}' not found in the available pool — skipping.")
    return banned


def prompt_pick(team: str, pick_num: int, available: list[str]) -> str:
    """
    Ask who was actually picked. Returns the canonical Brawler name.
    Keeps prompting until valid input is given.
    """
    while True:
        raw = input(f"\n  → {team} Team picks (enter Brawler name): ").strip()
        match = find_brawler(raw, available)
        if match:
            return match
        print(f"  [!] '{raw}' is not in the available pool. "
              "It may be misspelled, already picked, or banned.")


# ---------------------------------------------------------------------------
# DISPLAY HELPERS
# ---------------------------------------------------------------------------

def header(text: str) -> None:
    print("\n" + "=" * 55)
    print(f"  {text}")
    print("=" * 55)


def show_state(
    map_name: str,
    blue: list[str],
    red: list[str],
    banned: list[str],
) -> None:
    print(f"\n  Map       : {map_name}")
    print(f"  Banned    : {', '.join(banned) if banned else '—'}")
    print(f"  Blue Team : {', '.join(blue) if blue else '—'}")
    print(f"  Red  Team : {', '.join(red) if red else '—'}")


def show_recommendations(
    recs: list[tuple[str, int, list[str]]],
    team: str,
    pick_label: str,
) -> None:
    print(f"\n  Top 3 recommendations for {team} Team ({pick_label}):")
    print("  " + "-" * 48)
    for rank, (name, score, reasons) in enumerate(recs, 1):
        role = BRAWLERS[name]["role"]
        print(f"\n  #{rank}  {name}  [{role}]  —  Score: {score}/100")
        for r in reasons:
            print(f"       • {r}")
    print()


# ---------------------------------------------------------------------------
# MAIN DRAFT LOOP
# ---------------------------------------------------------------------------

def run_draft() -> None:
    print("\n" + "#" * 55)
    print("  BRAWL STARS RANKED DRAFT PICKER ASSISTANT")
    print("#" * 55)

    # Build mutable pool
    available: list[str] = list(BRAWLERS.keys())

    # --- Step 1: Map selection ---
    map_name, archetype = prompt_map()
    print(f"\n  Map locked: {map_name}  ({archetype})")

    # --- Step 2: Bans ---
    banned = prompt_bans(available)

    # Team state
    blue_picks: list[str] = []
    red_picks: list[str] = []

    # Draft labels for display
    pick_labels = [
        "Pick 1 of 1",   # Blue 1
        "Pick 1 of 2",   # Red 1
        "Pick 2 of 2",   # Red 2
        "Pick 1 of 2",   # Blue 2
        "Pick 2 of 2",   # Blue 3
        "Pick 3 of 3",   # Red 3  (final pick)
    ]

    # --- Step 3: Draft sequence ---
    for step_idx, (team, _) in enumerate(DRAFT_ORDER):
        pick_label = pick_labels[step_idx]
        my_picks  = blue_picks if team == "Blue" else red_picks
        opp_picks = red_picks  if team == "Blue" else blue_picks

        header(f"STEP {step_idx + 1}  —  {team.upper()} TEAM  ({pick_label})")
        show_state(map_name, blue_picks, red_picks, banned)

        # Compute & show recommendations
        recs = get_top_recommendations(
            available, archetype, my_picks, opp_picks
        )
        show_recommendations(recs, team, pick_label)

        # Accept input
        chosen = prompt_pick(team, step_idx + 1, available)
        available.remove(chosen)
        my_picks.append(chosen)

        print(f"  ✓  {chosen} locked in for {team} Team.")

    # --- Final summary ---
    header("DRAFT COMPLETE — FINAL TEAMS")
    show_state(map_name, blue_picks, red_picks, banned)

    print("\n  ──────────────────────────────────────────────")
    print("  BLUE TEAM composition:")
    for b in blue_picks:
        print(f"    • {b}  [{BRAWLERS[b]['role']}]")

    print("\n  RED TEAM composition:")
    for r in red_picks:
        print(f"    • {r}  [{BRAWLERS[r]['role']}]")

    print("\n  Good luck and have fun! 🏆")
    print("=" * 55 + "\n")


# ---------------------------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        run_draft()
    except KeyboardInterrupt:
        print("\n\n  Draft cancelled. See you in the arena!")
        sys.exit(0)
