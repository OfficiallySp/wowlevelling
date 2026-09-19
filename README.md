# WoW Leveling Calculator

A leveling time calculator for the live versions of World of Warcraft Classic: **WoW Forever**, **Classic Era**, **TBC Anniversary** and **MoP Classic**.

## 💜 Partner: RestedXP

Premium WoW leveling guides from **[RestedXP](https://shop.restedxp.com/ref/officiallysp/)** (affiliate link). Use code **FGJCV0TO7U** for **10% off** at checkout.

---

## Supported versions

| Version | Levels | XP curve | Total XP |
| --- | --- | --- | --- |
| WoW Forever (Classic+) | 1-60 | Vanilla 1.12 — Blizzard confirmed the 1-60 curve is unchanged | 4,084,700 |
| Classic Era / Hardcore | 1-60 | Vanilla 1.12 | 4,084,700 |
| TBC Anniversary | 1-70 | Post-patch 2.3 (levels 11-59 cut by up to ~18%) | 10,141,700 |
| MoP Classic | 1-90 | Post-patch 5.3 (85-89 cut by 33%) | 95,883,400 |

## Key features

- **Per-level calculation.** Both the XP required and the XP/hour you can earn change as you level, so the calculator walks level by level instead of applying one flat rate across the whole span.
- **Play styles:** questing, dungeon grinding, mixed, and PvP, with rates tuned per version.
- **Pace:** casual (first time through, no guide), average, or optimized (guide addon, tight route).
- **Stacking XP bonuses**, filtered per version — rested, heirlooms and guild perks in MoP, Joyous Journeys where it applies. Bonuses raise the XP you earn per hour; they never change the XP the level requires.
- **Zone recommendations** per version, including the four new WoW Forever zones.

## Data sources and accuracy

XP tables were verified on **19 September 2026** against the Warcraft Wiki [Experience to level](https://warcraft.wiki.gg/wiki/Experience_to_level) tables. The tables store *XP required to advance from* a level (the same convention the wiki uses) so they can be re-checked without re-indexing.

Version-specific notes behind the current numbers:

- **WoW Forever** launches 4 November 2026; beta started 17 September 2026. The 1-60 XP curve is unchanged from Classic, but dungeon mob XP is reduced and dungeon quest XP is raised, so questing is meant to beat dungeon spam. Forever rates are pre-launch estimates and should be revisited once players report live numbers.
- **TBC Anniversary** opened the Dark Portal on 5 February 2026 and uses the post-2.3 curve. Outland (58-70) is about 70% of the total XP but the faster half of the run.
- **MoP Classic** is on patch 5.5.3 / Siege of Orgrimmar. The Escalation patch (31 March 2026) applied the 5.3 reduction, so 85-90 now needs 64,990,000 XP rather than 97,500,000. The Joyous Journeys +50% buff ran from 21 April 2026 until Siege of Orgrimmar released in early June 2026 and is no longer active.

XP/hour rates are calibrated so a full run at each pace lands inside the completion times players report:

| Version | Casual | Average | Optimized |
| --- | --- | --- | --- |
| WoW Forever 1-60 (questing) | ~103 h | ~62 h | ~39 h |
| Classic Era 1-60 (questing) | ~118 h | ~71 h | ~44 h |
| TBC Anniversary 1-70 (questing) | ~90 h | ~54 h | ~34 h |
| MoP Classic 1-90 (questing) | ~54 h | ~32 h | ~20 h |

Those are base numbers with no XP bonus active. MoP with heirlooms lands near the commonly reported 25 hours for a prepared player, and MoP 85-90 alone comes out around 8-9 hours.

## Updating the rates

Rates and bonuses live in `GAME_VERSIONS` in `script.js`, one entry per version. Rate bands are `[upToLevel, xpPerHour]` at the average pace with no bonus active, and apply while your level is below `upToLevel`. Pace multipliers are in `PACE_MULTIPLIERS`.

When Forever goes live, the two things most likely to need revising are the Forever `questing` and `dungeon` bands, once the size of the dungeon XP change is known.
