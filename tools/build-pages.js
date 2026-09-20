#!/usr/bin/env node
'use strict';

// -----------------------------------------------------------------------------
// Static page generator
// -----------------------------------------------------------------------------
// Emits the hub page, one page per game version, and sitemap.xml. Every XP total,
// bracket table and hours-to-cap figure is computed from script.js, so editing a
// rate band or an XP table and re-running this keeps the prose honest.
//
//   node tools/build-pages.js
//
// Netlify serves this repo as plain static files, so the output is committed
// rather than built on deploy.
// -----------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const { GAME_VERSIONS, PACE_MULTIPLIERS } = require(path.join(ROOT, 'script.js'));

const SITE = 'https://wowlevelling.officiallysp.net';
const VERIFIED = '2026-09-19';
const VERIFIED_HUMAN = '19 September 2026';
const MODIFIED = '2026-09-20';
const PUBLISHED = '2026-06-04';
const AFFILIATE = 'https://shop.restedxp.com/ref/officiallysp/';
const WIKI = 'https://warcraft.wiki.gg/wiki/Experience_to_level';

// -----------------------------------------------------------------------------
// Derived numbers
// -----------------------------------------------------------------------------

const PACES = ['casual', 'average', 'optimized'];
const STYLES = [
    ['questing', 'Questing'],
    ['dungeon', 'Dungeon grinding'],
    ['mixed', 'Mixed'],
    ['pvp', 'PvP']
];

function xpToAdvance(version, level) {
    return version.xpTable[level - 1] || 0;
}

function totalXp(version, from, to) {
    let total = 0;
    for (let level = from; level < to; level++) total += xpToAdvance(version, level);
    return total;
}

function xpPerHourAt(version, style, level) {
    const bands = version.rates[style] || version.rates.questing;
    for (const [upTo, rate] of bands) {
        if (level < upTo) return rate;
    }
    return bands[bands.length - 1][1];
}

// Hours for a full run at this style and pace, with no XP bonus active. Matches
// the level-by-level walk the calculator itself does.
function hoursFor(version, style, pace, from, to) {
    const multiplier = PACE_MULTIPLIERS[pace];
    let hours = 0;
    for (let level = from; level < to; level++) {
        hours += xpToAdvance(version, level) / (xpPerHourAt(version, style, level) * multiplier);
    }
    return hours;
}

const n = value => value.toLocaleString('en-US');
const hrs = value => '~' + Math.round(value) + ' h';
const pct = (part, whole) => {
    const share = (100 * part) / whole;
    return (share < 0.1 ? share.toFixed(2) : share.toFixed(1)) + '%';
};

// Level brackets used for the "XP needed per bracket" tables, with the expansion
// each one lands in where that is the interesting part of the answer.
const BRACKETS = {
    forever: [[1, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 60]],
    classic: [[1, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 60]],
    tbc: [[1, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 58], [58, 60], [60, 70, 'Outland']],
    mop: [
        [1, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 60],
        [60, 70, 'Outland'], [70, 80, 'Northrend'], [80, 85, 'Cataclysm'], [85, 90, 'Pandaria']
    ]
};

// -----------------------------------------------------------------------------
// HTML helpers
// -----------------------------------------------------------------------------

function table(caption, headers, rows, extraClass) {
    const head = headers.map(h => `<th scope="col">${h}</th>`).join('');
    const body = rows.map(cells => {
        const [first, ...rest] = cells;
        return `<tr><th scope="row">${first}</th>${rest.map(c => `<td>${c}</td>`).join('')}</tr>`;
    }).join('\n              ');
    return `<div class="table-wrap${extraClass ? ' ' + extraClass : ''}">
            <table class="data-table">
              <caption>${caption}</caption>
              <thead><tr>${head}</tr></thead>
              <tbody>
              ${body}
              </tbody>
            </table>
          </div>`;
}

function paceTable(version, caption, from, to) {
    return table(
        caption,
        ['Play style', 'Casual', 'Average', 'Optimized'],
        STYLES.map(([id, label]) => [label, ...PACES.map(p => hrs(hoursFor(version, id, p, from, to)))])
    );
}

function bracketTable(versionId, version, caption) {
    const cap = version.maxLevel;
    const whole = totalXp(version, 1, cap);
    return table(
        caption,
        ['Levels', 'XP required', `Share of 1-${cap}`],
        BRACKETS[versionId].map(([from, to, region]) => {
            const xp = totalXp(version, from, to);
            const label = region ? `${from} - ${to} (${region})` : `${from} - ${to}`;
            return [label, n(xp), pct(xp, whole)];
        })
    );
}

// Full per-level table. This is the thing people actually search for when they
// want "XP per level" rather than a total.
function perLevelTable(version, caption) {
    let cumulative = 0;
    const rows = [];
    for (let level = 1; level < version.maxLevel; level++) {
        const xp = xpToAdvance(version, level);
        cumulative += xp;
        rows.push([`${level} &rarr; ${level + 1}`, n(xp), n(cumulative)]);
    }
    // Long enough to need its own scroll container and a sticky header.
    return table(caption, ['Level', 'XP to next level', 'Cumulative XP'], rows, 'table-wrap-tall');
}

function zoneTable(version, caption) {
    const rows = [];
    for (const [bracket, zones] of Object.entries(version.zones)) {
        zones.forEach((zone, index) => {
            const notes = [zone.faction];
            if (zone.isNew) notes.unshift('New in Forever');
            if (zone.note) notes.push(zone.note);
            rows.push([index === 0 ? bracket : '', zone.name, zone.level, notes.join(' &middot; ')]);
        });
    }
    return table(caption, ['Bracket', 'Zone', 'Level range', 'Notes'], rows);
}

function bonusTable(version, caption) {
    return table(
        caption,
        ['Bonus', 'Value'],
        version.bonuses.map(b => [b.label, `+${b.value}%`])
    );
}

// -----------------------------------------------------------------------------
// Page copy
// -----------------------------------------------------------------------------

const VERSION_PAGES = [
    {
        id: 'forever',
        slug: 'wow-forever',
        nav: 'WoW Forever 1-60',
        title: 'WoW Forever Leveling Calculator - 1-60 Time &amp; XP',
        description:
            'How long 1-60 takes in WoW Forever. Verified XP table, XP/hour by play style and pace, the new Forever zones, and a shareable result link.',
        h1: 'WoW Forever Leveling Calculator',
        ogAlt: 'WoW Forever leveling calculator - 1 to 60 time and XP',
        intro: `Work out how long 1-60 will take in <strong>WoW Forever</strong>. The 1-60 XP
          curve is unchanged from Classic, so the XP side is firm - what is new is where that XP
          comes from, and the four new zones that change the route.`,
        lead: `WoW Forever launches on <time datetime="2026-11-04">4 November 2026</time>, with beta
          open since <time datetime="2026-09-17">17 September 2026</time>. Blizzard confirmed the
          1-60 XP curve is unchanged from Classic, so reaching 60 is still
          <strong>{{TOTAL}} XP</strong>. What changed is where that XP comes from: dungeon mob XP
          is reduced and dungeon quest XP is raised, which is meant to stop dungeon spam beating
          questing the way it does on Classic Era realms.`,
        extra: `<p>Forever also adds new leveling ground. Zephras Isle covers 1-12 for the Skyborne,
          The Riverglades adds 150+ quests in the awkward 35-45 bracket, Desolace and the Wetlands
          get expanded questing, and Krol'dok Stronghold is a 40-45 outdoor dungeon. That extra
          content matters most in the 30s and 40s, where vanilla routes traditionally run thin.</p>
          <p class="caveat">Forever rates are pre-launch estimates. The XP requirements are firm
          because the curve is unchanged, but the XP/hour bands - the dungeon ones especially -
          will be revised once players report live numbers after launch.</p>`,
        faq: [
            {
                q: 'How long will 1-60 take in WoW Forever?',
                a: `The 1-60 XP curve in WoW Forever is unchanged from Classic, so it is still
                  {{TOTAL}} XP. Because dungeon mob XP is cut and dungeon quest XP is raised,
                  questing is meant to be the fastest route: roughly {{Q_CASUAL}} hours casual,
                  {{Q_AVERAGE}} hours average and {{Q_OPTIMIZED}} hours optimized. These are
                  pre-launch estimates and will be revised once live data lands.`
            },
            {
                q: 'Is WoW Forever faster to level than Classic Era?',
                a: `Yes, on these estimates. The XP requirement is identical at {{TOTAL}} XP, but
                  Forever pays more quest XP per hour and adds zones that remove the dead spots in
                  the 30s and 40s, so an average questing run lands near {{Q_AVERAGE}} hours
                  against roughly 71 hours on Classic Era.`
            },
            {
                q: 'Do heirlooms or XP buffs work in WoW Forever?',
                a: `Heirlooms do not exist in WoW Forever, so rested XP is the practical bonus.
                  The calculator also carries a Joyous Journeys-style +50% option so you can model
                  what a launch or catch-up buff would do if Blizzard enables one.`
            },
            {
                q: 'Should I level in dungeons in WoW Forever?',
                a: `Not as your main route. Dungeon mob XP is reduced on purpose, and dungeon
                  grinding comes out around {{D_AVERAGE}} hours at an average pace against
                  {{Q_AVERAGE}} for questing. Dungeon quests are worth more than they were in
                  Classic, so running a dungeon for its quests as part of a questing route is
                  still worthwhile.`
            }
        ]
    },
    {
        id: 'classic',
        slug: 'classic-era',
        nav: 'Classic Era 1-60',
        title: 'WoW Classic Era Leveling Calculator - 1-60 Time &amp; XP',
        description:
            'How long 1-60 takes on Classic Era and Hardcore realms. The original 1.12 XP table, XP/hour by play style, zone routes and a shareable result link.',
        h1: 'Classic Era Leveling Calculator',
        ogAlt: 'WoW Classic Era leveling calculator - 1 to 60 time and XP',
        intro: `Work out how long 1-60 will take on <strong>Classic Era</strong> and
          <strong>Hardcore</strong> realms - the original 1.12 curve, no heirlooms, no XP buffs.`,
        lead: `Classic Era and Hardcore realms run the original patch 1.12 curve:
          <strong>{{TOTAL}} XP</strong> from 1 to 60, no heirlooms, no XP buffs, no shortcuts. It
          is the slowest 1-60 of any live version, and the back half is where the time goes.
          Levels 50-60 alone are {{LATE}} XP - about {{LATE_PCT}} of the entire run - while 1-10
          is under 1%.`,
        extra: `<p>Hardcore realms use the same XP table, so the XP figures apply directly - but
          treat the time estimates as a floor. Playing carefully enough to survive costs hours that
          none of these paces account for: corpse-run avoidance, levelling a level or two under the
          zone, and skipping the group content that pays best.</p>`,
        faq: [
            {
                q: 'How long does it take to level 1-60 in WoW Classic Era?',
                a: `Levels 1 to 60 need {{TOTAL}} XP on the original 1.12 curve. Questing with no
                  XP bonus, this calculator puts a first-time casual run at roughly {{Q_CASUAL}}
                  hours, an average run at roughly {{Q_AVERAGE}} hours, and an optimized run with
                  a guide addon and a tight route at roughly {{Q_OPTIMIZED}} hours.`
            },
            {
                q: 'How much XP do you need for level 60 in Classic Era?',
                a: `{{TOTAL}} XP in total. The curve is steep at the top: levels 50-60 alone are
                  {{LATE}} XP, about {{LATE_PCT}} of the whole run, and levels 1-10 are only
                  {{EARLY}} XP.`
            },
            {
                q: 'Is dungeon grinding faster than questing in Classic Era?',
                a: `Not over a full run. Dungeon spam comes out around {{D_AVERAGE}} hours at an
                  average pace against {{Q_AVERAGE}} hours questing, because forming groups and
                  travelling to instances eats the XP advantage. It is strong in specific brackets,
                  which is why the mixed play style beats both.`
            },
            {
                q: 'How long does Hardcore 1-60 take?',
                a: `The XP requirement is identical at {{TOTAL}} XP, so the calculator applies
                  directly. Expect to land above the casual estimate of {{Q_CASUAL}} hours in
                  practice - the careful pulling, under-levelling and route caution that keeps a
                  Hardcore character alive are not free.`
            }
        ]
    },
    {
        id: 'tbc',
        slug: 'tbc-anniversary',
        nav: 'TBC Anniversary 1-70',
        title: 'TBC Anniversary Leveling Calculator - 1-70 Time &amp; XP',
        description:
            'How long 1-70 takes in TBC Anniversary. Post-2.3 XP table, Outland XP breakdown, XP/hour by play style and a shareable result link.',
        h1: 'TBC Anniversary Leveling Calculator',
        ogAlt: 'TBC Anniversary leveling calculator - 1 to 70 time and XP',
        intro: `Work out how long 1-70 will take in <strong>TBC Anniversary</strong>, on the
          post-2.3 curve that cut levels 11-59 and made Outland the bulk of the run.`,
        lead: `TBC Anniversary opened the Dark Portal on
          <time datetime="2026-02-05">5 February 2026</time> and runs the post-patch 2.3 curve,
          which cut levels 11-59 by up to about 18%. That makes 1-60 cheaper here -
          {{TO_SIXTY}} XP - than on Classic Era, but the total to 70 is
          <strong>{{TOTAL}} XP</strong> because Outland is expensive: levels 60-70 are
          {{OUTLAND}} XP, roughly {{OUTLAND_PCT}} of the whole run.`,
        extra: `<p>Outland is still the fast half. Quest XP per hour from Hellfire Peninsula onward
          is several times what Azeroth pays, so the last ten levels take far less real time than
          their XP cost suggests. The usual plan is to push to 58, step through the Dark Portal,
          and never look back.</p>`,
        faq: [
            {
                q: 'How long does 1-70 take in TBC Anniversary?',
                a: `1-70 is {{TOTAL}} XP, and Outland from 60 to 70 is {{OUTLAND}} of that, about
                  {{OUTLAND_PCT}}. Questing with no XP bonus lands near {{Q_CASUAL}} hours casual,
                  {{Q_AVERAGE}} hours average and {{Q_OPTIMIZED}} hours optimized, because Outland
                  quest XP per hour is several times higher than Azeroth's.`
            },
            {
                q: 'How much XP is 1-60 in TBC Anniversary?',
                a: `{{TO_SIXTY}} XP, against {{VANILLA_SIXTY}} XP on Classic Era. The post-2.3
                  curve cut levels 11-59 by up to about 18%, so the Azeroth half of a TBC run is
                  meaningfully shorter than the same levels on a Classic Era realm.`
            },
            {
                q: 'When should I go to Outland?',
                a: `At 58, as soon as the Dark Portal lets you through. Hellfire Peninsula quest
                  rewards and XP outclass anything left in Azeroth at that level, and levels 58-60
                  are only {{FIFTY_EIGHT_SIXTY}} XP, so there is little reason to finish Azeroth
                  zones first.`
            },
            {
                q: 'Is dungeon grinding worth it in TBC?',
                a: `It is close. Dungeons come out around {{D_AVERAGE}} hours at an average pace
                  against {{Q_AVERAGE}} hours questing, so the choice is mostly preference.
                  Mixing the two is fastest at roughly {{M_AVERAGE}} hours, since Outland dungeon
                  quests pay well alongside a normal questing route.`
            }
        ]
    },
    {
        id: 'mop',
        slug: 'mop-classic',
        nav: 'MoP Classic 1-90',
        title: 'MoP Classic Leveling Calculator - 1-90 Time &amp; XP',
        description:
            'How long 1-90 takes in MoP Classic on patch 5.5.3. Post-5.3 XP table, 85-90 breakdown, heirloom and guild bonuses, and a shareable result link.',
        h1: 'MoP Classic Leveling Calculator',
        ogAlt: 'MoP Classic leveling calculator - 1 to 90 time and XP',
        intro: `Work out how long 1-90 will take in <strong>MoP Classic</strong>, including the
          heirloom and guild bonuses that no other live version has.`,
        lead: `MoP Classic is on patch 5.5.3, Siege of Orgrimmar. The Escalation patch on
          <time datetime="2026-03-31">31 March 2026</time> applied the 5.3 XP reduction, so levels
          85-90 now need <strong>{{PANDARIA}} XP</strong> instead of 97,500,000 - a third off the
          most expensive stretch in the game. The full 1-90 run is {{TOTAL}} XP, and Pandaria is
          still {{PANDARIA_PCT}} of it.`,
        extra: `<p>MoP is also the only live version with real XP stacking: heirloom chest and
          shoulders for +20%, the guild perk Fast Track for +10%, and rested on top. That is why a
          prepared player with heirlooms lands near the commonly reported 25 hours rather than the
          {{Q_AVERAGE}} the base questing numbers show, and why 85-90 on its own comes out around
          8-9 hours.</p>
          <p>It is also the one version where dungeon grinding beats questing outright, at roughly
          {{D_AVERAGE}} hours against {{Q_AVERAGE}}, because Dungeon Finder removes the travel and
          group-forming time that makes dungeon spam expensive in Classic Era.</p>`,
        faq: [
            {
                q: 'How long does 1-90 take in MoP Classic?',
                a: `1-90 is {{TOTAL}} XP, of which {{PANDARIA}} is levels 85-90 alone. Questing
                  with no XP bonus is roughly {{Q_CASUAL}} hours casual, {{Q_AVERAGE}} hours
                  average and {{Q_OPTIMIZED}} hours optimized. With heirlooms and rested a prepared
                  player lands nearer the commonly reported 25 hours, and 85-90 on its own is about
                  8-9 hours.`
            },
            {
                q: 'How much XP is 85 to 90 in MoP Classic?',
                a: `{{PANDARIA}} XP since the Escalation patch applied the 5.3 reduction on 31
                  March 2026, down from 97,500,000. That is {{PANDARIA_PCT}} of the entire 1-90
                  run packed into five levels.`
            },
            {
                q: 'Do heirlooms stack with rested XP in MoP Classic?',
                a: `Yes. Heirloom chest and shoulders give +20% combined, the guild perk Fast Track
                  adds +10%, and rested stacks on top of both. Only the two rested options in the
                  calculator are mutually exclusive, because they describe the same buff at
                  different intensities.`
            },
            {
                q: 'Is the Joyous Journeys XP buff still active in MoP Classic?',
                a: `Not right now. The +50% Joyous Journeys buff ran from 21 April 2026 until Siege
                  of Orgrimmar released in early June 2026. The checkbox is still in the calculator
                  so you can model what happens if Blizzard turns it back on.`
            }
        ]
    }
];

const HUB_FAQ = [
    {
        q: 'How long does it take to level 1-60 in WoW Classic Era?',
        a: `Levels 1 to 60 need {{classic.TOTAL}} XP on the original 1.12 curve. Questing with no
          XP bonus, this calculator puts a first-time casual run at roughly {{classic.Q_CASUAL}}
          hours, an average run at roughly {{classic.Q_AVERAGE}} hours, and an optimized run with a
          guide addon and a tight route at roughly {{classic.Q_OPTIMIZED}} hours.`
    },
    {
        q: 'How long will 1-60 take in WoW Forever?',
        a: `The 1-60 XP curve in WoW Forever is unchanged from Classic, so it is still
          {{forever.TOTAL}} XP. Because dungeon mob XP is cut and dungeon quest XP is raised,
          questing is meant to be the fastest route: roughly {{forever.Q_CASUAL}} hours casual,
          {{forever.Q_AVERAGE}} hours average and {{forever.Q_OPTIMIZED}} hours optimized. These
          are pre-launch estimates and will be revised once live data lands.`
    },
    {
        q: 'How much XP do you need to reach level 60?',
        a: `{{classic.TOTAL}} XP in Classic Era and WoW Forever, which both use the vanilla 1.12
          curve. In TBC Anniversary the post-2.3 curve cuts levels 11-59, so 1-60 is
          {{tbc.TO_SIXTY}} XP. Levels 50-60 alone are {{classic.LATE}} XP, about
          {{classic.LATE_PCT}} of the whole vanilla run.`
    },
    {
        q: 'How long does 1-70 take in TBC Anniversary?',
        a: `1-70 is {{tbc.TOTAL}} XP, and Outland from 60 to 70 is {{tbc.OUTLAND}} of that, about
          {{tbc.OUTLAND_PCT}}. Questing with no XP bonus lands near {{tbc.Q_CASUAL}} hours casual,
          {{tbc.Q_AVERAGE}} hours average and {{tbc.Q_OPTIMIZED}} hours optimized, because Outland
          quest XP per hour is several times higher than Azeroth's.`
    },
    {
        q: 'How long does 1-90 take in MoP Classic?',
        a: `1-90 is {{mop.TOTAL}} XP, of which {{mop.PANDARIA}} is levels 85-90 alone. Questing
          with no XP bonus is roughly {{mop.Q_CASUAL}} hours casual, {{mop.Q_AVERAGE}} hours
          average and {{mop.Q_OPTIMIZED}} hours optimized. With heirlooms and rested a prepared
          player lands nearer the commonly reported 25 hours, and 85-90 on its own is about 8-9
          hours.`
    },
    {
        q: 'Does rested XP make leveling faster?',
        a: `Yes, but it changes how fast you earn XP, never how much a level costs. Rested doubles
          the XP you get from killing mobs while the bonus lasts, which works out to roughly +15
          percent over a normal play session, or nearer +30 percent if you only play an alt in
          short sessions and log out in an inn. Pick the matching bonus checkbox and the estimate
          drops accordingly.`
    },
    {
        q: 'Is dungeon grinding faster than questing?',
        a: `It depends on the version. In Classic Era dungeon spam is slower overall than questing,
          around {{classic.D_AVERAGE}} hours versus {{classic.Q_AVERAGE}} at an average pace,
          though it is strong in specific brackets. In MoP Classic dungeons are the fastest single
          route at roughly {{mop.D_AVERAGE}} hours. In WoW Forever dungeon mob XP is reduced on
          purpose, so questing wins clearly.`
    },
    {
        q: 'Do heirlooms work in Classic Era and WoW Forever?',
        a: `No. Heirlooms do not exist in Classic Era, Hardcore or WoW Forever, so the only XP
          bonus available there is rested. MoP Classic has heirloom chest and shoulders for +20
          percent combined, plus the guild perk Fast Track for another +10 percent.`
    },
    {
        q: 'Can I share a link to my result?',
        a: `Yes. The calculator writes your version, levels, play style, pace and XP bonuses into
          the address bar as you change them, so copying the URL shares exactly what you are
          looking at. There is a Copy link button under the results if you would rather not select
          the address bar.`
    }
];

// -----------------------------------------------------------------------------
// Per-version computed values used to fill {{TOKENS}} in the copy above
// -----------------------------------------------------------------------------

function statsFor(versionId) {
    const version = GAME_VERSIONS[versionId];
    const cap = version.maxLevel;
    const total = totalXp(version, 1, cap);
    const values = {
        TOTAL: n(total),
        EARLY: n(totalXp(version, 1, 10)),
        LATE: n(totalXp(version, 50, 60)),
        LATE_PCT: pct(totalXp(version, 50, 60), total),
        TO_SIXTY: n(totalXp(version, 1, 60)),
        VANILLA_SIXTY: n(totalXp(GAME_VERSIONS.classic, 1, 60)),
        OUTLAND: n(totalXp(version, 60, Math.min(70, cap))),
        OUTLAND_PCT: pct(totalXp(version, 60, Math.min(70, cap)), total),
        FIFTY_EIGHT_SIXTY: n(totalXp(version, 58, 60)),
        PANDARIA: n(totalXp(version, 85, Math.min(90, cap))),
        PANDARIA_PCT: pct(totalXp(version, 85, Math.min(90, cap)), total)
    };
    for (const [styleId] of STYLES) {
        for (const pace of PACES) {
            const key = styleId[0].toUpperCase() + '_' + pace.toUpperCase();
            values[key] = Math.round(hoursFor(version, styleId, pace, 1, cap));
        }
    }
    return values;
}

const STATS = {};
for (const id of Object.keys(GAME_VERSIONS)) STATS[id] = statsFor(id);

// Fills {{KEY}} against one version's stats, and {{version.KEY}} against any.
function fill(text, versionId) {
    return text.replace(/\{\{([a-z]+\.)?([A-Z_]+)\}\}/g, (match, prefix, key) => {
        const stats = prefix ? STATS[prefix.slice(0, -1)] : STATS[versionId];
        if (!stats || stats[key] === undefined) {
            throw new Error('Unknown token ' + match + ' (version ' + versionId + ')');
        }
        return stats[key];
    });
}

// Collapses the indented template literals above into clean prose for the
// JSON-LD answers, which must match the rendered text.
const flat = text => text.replace(/\s+/g, ' ').trim();

// -----------------------------------------------------------------------------
// Shared chrome
// -----------------------------------------------------------------------------

function assetHash(file) {
    return crypto.createHash('sha1')
        .update(fs.readFileSync(path.join(ROOT, file)))
        .digest('hex')
        .slice(0, 8);
}

// styles.css and script.js have no hash in their filename, so the query string
// is what lets netlify.toml cache them for a year without going stale.
const CSS_V = assetHash('styles.css');
const JS_V = assetHash('script.js');

function head(page) {
    const url = page.slug ? `${SITE}/${page.slug}/` : `${SITE}/`;
    const og = `${SITE}/assets/${page.ogImage}`;
    return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />

    <!-- Primary Meta Tags -->
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <meta name="author" content="OfficiallySp" />
    <meta
      name="robots"
      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    />

    <!-- Canonical URL. Query-string state (?from=, ?to=, ...) collapses here. -->
    <link rel="canonical" href="${url}" />

    <!-- Warm up the third-party connections the page actually makes -->
    <link rel="preconnect" href="https://officiallysp.net" crossorigin />
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin />
    <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:image" content="${og}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${page.ogAlt}" />
    <meta property="og:site_name" content="WoW Leveling Calculator" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:updated_time" content="${MODIFIED}T00:00:00+00:00" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${og}" />
    <meta name="twitter:image:alt" content="${page.ogAlt}" />

    <!-- Icons. Google needs a crawlable favicon URL to show an icon in search
         results, so these are real files rather than an inline data URI. -->
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/assets/favicon-96x96.png" sizes="96x96" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Additional Meta Tags -->
    <meta name="theme-color" content="#1a1a2e" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- GENERATED FILE - edit tools/build-pages.js and re-run it, not this. -->
    <script type="application/ld+json">
${page.jsonLd}
    </script>

    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1548903334937961"
      crossorigin="anonymous"
    ></script>
    <link rel="stylesheet" href="https://officiallysp.net/assets/css/design-tokens.css" />
    <link rel="stylesheet" href="/styles.css?v=${CSS_V}" />
    <script src="/script.js?v=${JS_V}" defer></script>
  </head>`;
}

function jsonLd(page) {
    const url = page.slug ? `${SITE}/${page.slug}/` : `${SITE}/`;
    const breadcrumb = [
        { '@type': 'ListItem', position: 1, name: 'OfficiallySp', item: 'https://officiallysp.net' },
        { '@type': 'ListItem', position: 2, name: 'WoW Leveling Calculator', item: `${SITE}/` }
    ];
    if (page.slug) {
        breadcrumb.push({ '@type': 'ListItem', position: 3, name: page.nav });
    }

    const graph = [
        {
            '@type': 'Person',
            '@id': 'https://officiallysp.net/#person',
            name: 'OfficiallySp',
            url: 'https://officiallysp.net'
        },
        {
            '@type': 'WebSite',
            '@id': `${SITE}/#website`,
            url: `${SITE}/`,
            name: 'WoW Leveling Calculator',
            inLanguage: 'en',
            publisher: { '@id': 'https://officiallysp.net/#person' }
        },
        {
            '@type': 'WebApplication',
            '@id': url + '#app',
            name: page.appName,
            url: url,
            description: page.appDescription,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web Browser',
            browserRequirements: 'Requires JavaScript',
            inLanguage: 'en',
            isAccessibleForFree: true,
            dateModified: MODIFIED,
            author: { '@id': 'https://officiallysp.net/#person' },
            screenshot: `${SITE}/assets/${page.ogImage}`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: page.featureList
        },
        {
            '@type': 'BreadcrumbList',
            '@id': url + '#breadcrumb',
            itemListElement: breadcrumb
        },
        {
            '@type': ['WebPage', 'FAQPage'],
            '@id': url + '#webpage',
            url: url,
            name: page.title.replace(/&amp;/g, '&'),
            description: page.description,
            isPartOf: { '@id': `${SITE}/#website` },
            breadcrumb: { '@id': url + '#breadcrumb' },
            primaryImageOfPage: `${SITE}/assets/${page.ogImage}`,
            inLanguage: 'en',
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
            author: { '@id': 'https://officiallysp.net/#person' },
            about: {
                '@type': 'VideoGame',
                name: 'World of Warcraft Classic',
                publisher: { '@type': 'Organization', name: 'Blizzard Entertainment' }
            },
            mainEntity: page.faq.map(item => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a }
            }))
        }
    ];

    return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
        .split('\n').map(line => '      ' + line).join('\n');
}

function versionNav(currentSlug) {
    const links = [{ slug: '', nav: 'All versions' }]
        .concat(VERSION_PAGES.map(p => ({ slug: p.slug, nav: p.nav })))
        .map(p => {
            const href = p.slug ? `/${p.slug}/` : '/';
            const current = p.slug === currentSlug;
            return current
                ? `<li><span aria-current="page">${p.nav}</span></li>`
                : `<li><a href="${href}">${p.nav}</a></li>`;
        }).join('\n            ');
    return `<nav class="version-nav" aria-label="Game versions">
          <ul>
            ${links}
          </ul>
        </nav>`;
}

function affiliateHero() {
    return `<section class="rxp-hero" aria-label="RestedXP premium leveling guides">
        <a
          class="rxp-hero-link"
          href="${AFFILIATE}"
          target="_blank"
          rel="sponsored noopener noreferrer"
          title="RestedXP premium WoW leveling guides - 10% off with partner code"
        >
          <img
            src="/rxpassets/leaderboard-affiliate-banner-4.png"
            alt="RestedXP premium guides - level ultra-fast. Claim 10% off now."
            width="728"
            height="90"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </a>
        <div class="rxp-code-strip">
          <span>Partner code for <strong>10% off</strong>:</span>
          <code id="rxpDiscountCode">FGJCV0TO7U</code>
          <button type="button" class="rxp-copy-btn" id="rxpCopyCode" aria-label="Copy discount code FGJCV0TO7U">
            Copy code
          </button>
          <a
            class="rxp-shop-link"
            href="${AFFILIATE}"
            target="_blank"
            rel="sponsored noopener noreferrer"
          >Shop RestedXP guides &rarr;</a>
          <p class="rxp-affiliate-note">Affiliate link - supports OfficiallySp at no extra cost to you.</p>
        </div>
      </section>`;
}

function affiliateSquare(image) {
    return `<div class="rxp-medium-promo">
                    <a
                      class="rxp-medium-link"
                      href="${AFFILIATE}"
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      title="RestedXP premium leveling guides - 10% off"
                    >
                      <img
                        src="/rxpassets/${image}"
                        alt="RestedXP premium leveling guides - get 10% off. Click to shop."
                        width="300"
                        height="300"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </div>`;
}

function calculator(page) {
    const version = page.versionId ? GAME_VERSIONS[page.versionId] : GAME_VERSIONS.forever;
    const cap = version.maxLevel;
    const options = Object.entries(GAME_VERSIONS).map(([id, v]) => {
        const selected = page.versionId ? id === page.versionId : id === 'forever';
        return `<option value="${id}"${selected ? ' selected' : ''}>${v.label}</option>`;
    }).join('\n              ');

    const pickerHint = page.versionId
        ? '<p class="version-picker-hint">Switching version opens that version\'s page.</p>'
        : '';

    return `<div class="input-group version-picker">
            <label for="gameVersion">Game Version</label>
            <select id="gameVersion" onchange="onVersionSelect()">
              ${options}
            </select>
            ${pickerHint}
          </div>
          <p class="version-note" id="versionNote"></p>

          <div class="calculator-layout">
            <div class="calculator-main">
              <div class="calculator-grid">
                <div class="input-section">
                  <h3>Character Information</h3>

                  <div class="input-group">
                    <label for="currentLevel">Current Level:</label>
                    <input type="number" id="currentLevel" min="1" max="${cap - 1}" value="1" />
                  </div>

                  <div class="input-group">
                    <label for="targetLevel">Target Level:</label>
                    <input type="number" id="targetLevel" min="2" max="${cap}" value="${cap}" />
                  </div>

                  <div class="input-group">
                    <label for="currentXP">Current XP in Level:</label>
                    <input type="number" id="currentXP" min="0" value="0" />
                  </div>

                  <fieldset class="input-group bonus-fieldset">
                    <legend>XP Bonuses:</legend>
                    <div class="xp-bonus-list" id="xpBonuses"></div>
                  </fieldset>

                  <div class="input-group">
                    <label for="playStyle">Play Style:</label>
                    <select id="playStyle">
                      <option value="questing">Questing</option>
                      <option value="dungeon">Dungeon Grinding</option>
                      <option value="mixed">Mixed (Questing + Dungeons)</option>
                      <option value="pvp">PvP</option>
                    </select>
                  </div>

                  <div class="input-group">
                    <label for="pace">Pace:</label>
                    <select id="pace">
                      <option value="casual">Casual - first time through, no guide</option>
                      <option value="average" selected>Average - decent route, some downtime</option>
                      <option value="optimized">Optimized - guide addon, tight route</option>
                    </select>
                  </div>

                  <button class="btn" onclick="calculateLeveling()">Refresh</button>

                  ${affiliateSquare('square-affiliate-banner-1.png')}
                </div>

                <div class="results-section">
                  <h3>Leveling Statistics</h3>

                  <div class="result-item">
                    <div class="result-label">Total XP Needed:</div>
                    <div class="result-value" id="totalXP">-</div>
                  </div>

                  <div class="result-item">
                    <div class="result-label">Estimated Time:</div>
                    <div class="result-value" id="estimatedTime">-</div>
                  </div>

                  <div class="result-item">
                    <div class="result-label">Average XP per Hour:</div>
                    <div class="result-value" id="xpPerHour">-</div>
                  </div>

                  <div class="result-item">
                    <div class="result-label">Active XP Bonus:</div>
                    <div class="result-value" id="activeBonus">None</div>
                  </div>

                  <div class="result-item">
                    <div class="result-label">Current Level Progress:</div>
                    <div class="result-value" id="levelProgress">-</div>
                    <div class="progress-bar">
                      <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                  </div>

                  <div class="result-item">
                    <div class="result-label">Levels Remaining:</div>
                    <div class="result-value" id="levelsRemaining">-</div>
                  </div>

                  <div class="share-row">
                    <button type="button" class="btn btn-secondary" id="copyLinkBtn">
                      Copy link to this result
                    </button>
                    <p class="share-note">
                      The address bar tracks your settings, so the link opens exactly what you see.
                    </p>
                  </div>

                  <p class="data-note">
                    &#10024; XP tables verified ${VERIFIED_HUMAN} against
                    <a href="${WIKI}" target="_blank" rel="noopener noreferrer">Warcraft Wiki</a>.
                    XP/hour rates are calibrated to reported completion times per version.
                  </p>

                  ${affiliateSquare('affiliate-banner-2.png')}
                </div>

                <div class="zone-recommendations">
                  <h3>Zones for your level range</h3>
                  <div class="zone-list" id="zoneList">
                    <!-- Zone recommendations will be populated here -->
                  </div>
                </div>
              </div>`;
}

function tocNav(sections) {
    const items = sections.map(s => `<li><a href="#${s.id}">${s.nav || s.heading}</a></li>`)
        .join('\n                  ');
    return `<nav class="toc" aria-labelledby="toc-heading">
                <h2 class="toc-heading" id="toc-heading">On this page</h2>
                <ul>
                  ${items}
                </ul>
              </nav>`;
}

function footer() {
    return `<footer class="site-footer">
        <p>
          <strong>WoW Leveling Calculator</strong> - a free tool by
          <a href="https://officiallysp.net" target="_blank" rel="noopener noreferrer">OfficiallySp</a>.
          XP data from
          <a href="${WIKI}" target="_blank" rel="noopener noreferrer">Warcraft Wiki</a>,
          verified <time datetime="${VERIFIED}">${VERIFIED_HUMAN}</time>.
        </p>
        <p class="footer-fineprint">
          Links to RestedXP are affiliate links and support this site at no extra cost
          to you. Not affiliated with or endorsed by Blizzard Entertainment. World of
          Warcraft is a trademark of Blizzard Entertainment, Inc.
        </p>
      </footer>`;
}

function renderPage(page) {
    page.jsonLd = jsonLd(page);

    const sectionHtml = page.sections.map(s => `<section id="${s.id}" class="content-section">
                  <h2>${s.heading}</h2>
                  ${s.body}
                </section>`).join('\n\n                ');

    const bodyAttr = page.versionId ? ` data-version="${page.versionId}"` : '';

    return `<!DOCTYPE html>
<!-- GENERATED by tools/build-pages.js - do not edit by hand. -->
<html lang="en">
${head(page)}
  <body${bodyAttr}>
    <a href="https://officiallysp.net" class="officiallysp-bar" aria-label="Part of OfficiallySp - More projects" style="--os-accent: #ffd700;">
      <span class="os-icon">&#9664;</span><span class="os-accent">OfficiallySp.net</span><span>- More projects</span>
    </a>
    <div class="container">
      <header class="page-header">
        <h1>${page.h1}</h1>
        <p class="page-intro">${page.intro}</p>
        <p class="byline">
          Made by
          <a href="https://officiallysp.net" target="_blank" rel="noopener noreferrer">OfficiallySp</a>
          &middot; XP tables verified
          <time datetime="${VERIFIED}">${VERIFIED_HUMAN}</time>
        </p>
        ${versionNav(page.slug)}
      </header>

      ${affiliateHero()}

      <main>
        <section class="calculator-section" aria-labelledby="calculator-heading">
          <h2 id="calculator-heading" class="visually-hidden">Leveling time calculator</h2>

          ${calculator(page)}

              ${tocNav(page.sections)}

              <div class="content-sections">
                ${sectionHtml}
              </div>

              <div class="rxp-footer-promo">
                <a
                  class="rxp-footer-link"
                  href="${AFFILIATE}"
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  title="Get RestedXP premium leveling guides - 10% off"
                >
                  <img
                    src="/rxpassets/leaderboard-affiliate-banner-4.png"
                    alt="RestedXP premium guides - level ultra-fast. Claim 10% off now."
                    width="728"
                    height="90"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
            </div>

            <aside class="rxp-aside" aria-label="RestedXP promotion">
              <a
                class="rxp-aside-link"
                href="${AFFILIATE}"
                target="_blank"
                rel="sponsored noopener noreferrer"
                title="RestedXP premium WoW leveling guides - 10% off"
              >
                <img
                  src="/rxpassets/skyscraper-affiliate-banner-2.png"
                  alt="RestedXP premium guides - level ultra-fast in WoW. Claim 10% off."
                  width="160"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </aside>
          </div>
        </section>
      </main>

      ${footer()}
    </div>
  </body>
</html>
`;
}

// -----------------------------------------------------------------------------
// Page assembly
// -----------------------------------------------------------------------------

function faqSection(faq) {
    const body = faq.map(item =>
        `<h3>${item.q}</h3>\n                  <p>${item.a}</p>`
    ).join('\n\n                  ');
    return { id: 'faq', heading: 'Frequently asked questions', nav: 'FAQ', body };
}

function buildVersionPage(def) {
    const version = GAME_VERSIONS[def.id];
    const cap = version.maxLevel;
    const stats = STATS[def.id];

    const faq = def.faq.map(item => ({ q: item.q, a: flat(fill(item.a, def.id)) }));

    const others = VERSION_PAGES.filter(p => p.id !== def.id)
        .map(p => `<li><a href="/${p.slug}/">${p.nav}</a> - ${GAME_VERSIONS[p.id].label}</li>`)
        .join('\n                    ');

    const sections = [
        {
            id: 'how-long',
            heading: `How long does 1-${cap} take in ${def.nav.replace(/ 1-\d+$/, '')}?`,
            nav: 'How long it takes',
            body: `<p>${fill(def.lead, def.id)}</p>
                  ${paceTable(version, `1-${cap}: hours to cap by play style, no XP bonus active`, 1, cap)}
                  ${fill(def.extra, def.id)}`
        },
        {
            id: 'xp-table',
            heading: `${def.nav.replace(/ 1-\d+$/, '')} XP table`,
            nav: 'XP table',
            body: `<p>The XP required to advance from each level, and the running total to that
                  point. Verified against the Warcraft Wiki
                  <a href="${WIKI}" target="_blank" rel="noopener noreferrer">Experience to level</a>
                  tables on <time datetime="${VERIFIED}">${VERIFIED_HUMAN}</time>.</p>
                  ${bracketTable(def.id, version, `XP needed per bracket (total 1-${cap}: ${stats.TOTAL} XP)`)}
                  ${perLevelTable(version, `Full per-level XP table, 1 to ${cap}`)}`
        },
        {
            id: 'zones',
            heading: 'Zone route by level bracket',
            nav: 'Zones',
            body: `<p>The zones the calculator recommends for each bracket. Pick the ones that match
                  your faction and keep two or three open at once - running dry on quests and having
                  to fly somewhere new is where most of the lost time in a levelling run goes.</p>
                  ${zoneTable(version, `${def.nav.replace(/ 1-\d+$/, '')} zones by level bracket`)}`
        },
        {
            id: 'bonuses',
            heading: 'XP bonuses available',
            nav: 'XP bonuses',
            body: `<p>An XP bonus never changes how much XP a level costs - it changes how fast you
                  earn it, so a +20% bonus cuts roughly 17% off the time rather than 20%. These are
                  the bonuses that apply in this version.</p>
                  ${bonusTable(version, `XP bonuses in ${def.nav.replace(/ 1-\d+$/, '')}`)}
                  <p>The two rested options describe the same buff at different intensities, so they
                  never stack with each other - ticking one unticks the other. Everything else adds
                  together. See <a href="/#methodology">how the numbers work</a> for what sits behind
                  the XP/hour rates.</p>`
        },
        faqSection(faq),
        {
            id: 'other-versions',
            heading: 'Other game versions',
            nav: 'Other versions',
            body: `<p>Levelling a character somewhere else? Each version has its own XP curve, rates
                  and zone route:</p>
                  <ul class="link-list">
                    ${others}
                    <li><a href="/">All versions compared</a> - totals and times side by side</li>
                  </ul>`
        }
    ];

    return renderPage({
        slug: def.slug,
        versionId: def.id,
        nav: def.nav,
        title: def.title,
        description: def.description,
        h1: def.h1,
        intro: fill(def.intro, def.id),
        ogImage: `og-${def.slug}.png`,
        ogAlt: def.ogAlt,
        appName: def.h1,
        appDescription: def.description,
        featureList: [
            `${def.nav} levelling time estimates`,
            'Per-level XP table and bracket breakdown',
            'XP per hour by play style and pace',
            'Zone route by level bracket',
            'Shareable result links'
        ],
        faq,
        sections
    });
}

function buildHubPage() {
    const faq = HUB_FAQ.map(item => ({ q: item.q, a: flat(fill(item.a, 'classic')) }));

    const comparisonRows = VERSION_PAGES.map(def => {
        const version = GAME_VERSIONS[def.id];
        const cap = version.maxLevel;
        return [
            `<a href="/${def.slug}/">${def.nav.replace(/ 1-\d+$/, '')}</a>`,
            `1-${cap}`,
            n(totalXp(version, 1, cap)),
            ...PACES.map(p => hrs(hoursFor(version, 'questing', p, 1, cap)))
        ];
    });

    const summaries = VERSION_PAGES.map(def => {
        const version = GAME_VERSIONS[def.id];
        const cap = version.maxLevel;
        const stats = STATS[def.id];
        return `<div class="version-card">
                    <h3><a href="/${def.slug}/">${def.h1}</a></h3>
                    <p>${fill(def.intro, def.id)}</p>
                    <p class="version-card-stats">
                      <strong>${stats.TOTAL} XP</strong> to ${cap} &middot;
                      ~${stats.Q_AVERAGE} h questing at an average pace
                    </p>
                  </div>`;
    }).join('\n\n                  ');

    const sections = [
        {
            id: 'how-long',
            heading: 'How long does it take to level in WoW Classic?',
            nav: 'How long leveling takes',
            body: `<p>Every live version of WoW Classic runs a different XP curve and pays XP at a
                  different rate, so "how long does leveling take" has four separate answers. The
                  table below is a full run to each version's level cap by questing, with no XP
                  bonus active - the same numbers the calculator above produces when you leave the
                  bonus boxes unticked.</p>
                  ${table(
                      'Time to reach the level cap by questing, no XP bonus active',
                      ['Version', 'Levels', 'Total XP', 'Casual', 'Average', 'Optimized'],
                      comparisonRows
                  )}
                  <p><strong>Casual</strong> is a first time through with no guide addon.
                  <strong>Average</strong> is a decent route with some downtime.
                  <strong>Optimized</strong> is a guide addon and a tight route with little time
                  spent idle. Rested XP, heirlooms and event buffs come off the top of these
                  numbers - see <a href="#xp-bonuses">XP bonuses</a>.</p>`
        },
        {
            id: 'versions',
            heading: 'Pick your version',
            nav: 'Versions',
            body: `<p>Each version has its own page with the full XP table, the zone route by
                  bracket and version-specific answers.</p>
                  <div class="version-cards">
                  ${summaries}
                  </div>`
        },
        {
            id: 'xp-bonuses',
            heading: 'XP bonuses and how much they actually save',
            nav: 'XP bonuses',
            body: `<p>An XP bonus never changes how much XP a level costs - it changes how fast you
                  earn it. A +20% bonus cuts roughly 17% off the time, not 20%. Which bonuses exist
                  depends on the version, so the calculator only offers the ones that apply to your
                  selection.</p>
                  ${table(
                      'Available XP bonuses by version',
                      ['Bonus', 'Value', 'Where it applies'],
                      [
                          ['Rested XP (typical play)', '+15%', 'All versions'],
                          ['Always rested (alt or short sessions)', '+30%', 'All versions'],
                          ['Heirloom chest + shoulders', '+20%', 'MoP Classic only'],
                          ['Guild perk: Fast Track', '+10%', 'MoP Classic only'],
                          ['Joyous Journeys', '+50%', 'Not currently active']
                      ]
                  )}
                  <p>Rested doubles the XP you get from killing mobs while the bonus holds. The two
                  rested options describe the same buff at different intensities, so they never
                  stack with each other - ticking one unticks the other. Everything else adds
                  together.</p>`
        },
        {
            id: 'methodology',
            heading: 'How the numbers work',
            nav: 'How the numbers work',
            body: `<p>Most leveling calculators divide total XP by a single XP/hour figure. That is
                  wrong in both directions: a level 12 character and a level 58 character earn
                  wildly different XP per hour, and the XP a level costs climbs steeply as you go.
                  This calculator walks the table one level at a time, applying the XP/hour band
                  that fits each level, so a 1-60 run and a 55-60 run are both estimated
                  honestly.</p>
                  <p>XP requirements come from the Warcraft Wiki
                  <a href="${WIKI}" target="_blank" rel="noopener noreferrer">Experience to level</a>
                  tables and were verified on
                  <time datetime="${VERIFIED}">${VERIFIED_HUMAN}</time>. Each version is mapped to
                  the curve its patch actually runs: vanilla 1.12 for Classic Era and WoW Forever,
                  post-2.3 for TBC Anniversary, post-5.3 for MoP Classic.</p>
                  <p>XP/hour rates are calibrated so a full run at each pace lands inside the
                  completion times players report for that version. They are estimates, not
                  measurements - your class, your route, your server's population and how much time
                  you spend in the auction house all move the real number. Treat the output as a
                  planning figure, not a promise.</p>`
        },
        faqSection(faq)
    ];

    return renderPage({
        slug: '',
        versionId: null,
        nav: 'All versions',
        title: 'WoW Leveling Calculator - Forever, Classic Era, TBC &amp; MoP',
        description:
            'Free leveling time and XP calculator for WoW Forever, Classic Era, TBC Anniversary and MoP Classic. Verified XP tables, XP/hour rates and zone routes.',
        h1: 'WoW Leveling Calculator',
        intro: `Work out how long leveling will take in <strong>WoW Forever</strong>,
          <strong>Classic Era</strong>, <strong>TBC Anniversary</strong> and
          <strong>MoP Classic</strong>. Pick your version, current level and target level, and the
          calculator walks the XP table level by level using XP/hour rates calibrated to the
          completion times players report in each version.`,
        ogImage: 'og-image.png',
        ogAlt: 'WoW Leveling Calculator - Forever, Classic Era, TBC and MoP Classic',
        appName: 'WoW Leveling Calculator',
        appDescription:
            'Leveling time and XP calculator for WoW Forever, Classic Era, TBC Anniversary and MoP Classic',
        featureList: [
            'WoW Forever (Classic+) leveling estimates for levels 1-60',
            'Classic Era, TBC Anniversary and MoP Classic XP tables',
            'Per-level XP per hour rates by play style and pace',
            'Rested, heirloom, guild and Joyous Journeys bonuses',
            'Zone recommendations per expansion',
            'Shareable result links'
        ],
        faq,
        sections
    });
}

function buildSitemap() {
    const urls = [{ loc: `${SITE}/`, priority: '1.0', image: 'og-image.png' }].concat(
        VERSION_PAGES.map(p => ({
            loc: `${SITE}/${p.slug}/`,
            priority: '0.9',
            image: `og-${p.slug}.png`
        }))
    );
    const entries = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${MODIFIED}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
    <image:image>
      <image:loc>${SITE}/assets/${u.image}</image:loc>
    </image:image>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATED by tools/build-pages.js - do not edit by hand. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;
}

// -----------------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------------

function write(relativePath, contents) {
    const target = path.join(ROOT, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
    console.log('  ' + relativePath + '  (' + Math.round(contents.length / 1024) + ' KB)');
}

function main() {
    console.log('Generating pages:');

    const hub = buildHubPage();
    write('index.html', hub);

    for (const def of VERSION_PAGES) {
        write(path.join(def.slug, 'index.html'), buildVersionPage(def));
    }

    write('sitemap.xml', buildSitemap());
    console.log('\nAsset versions: styles.css?v=' + CSS_V + '  script.js?v=' + JS_V);
}

main();
