# Prompt: add Easy Mode to the FlairSync Android manager app

Paste everything below the line into the Android agent.

---

## Context

FlairSync is a restaurant/café management platform. The people using the manager
app are restaurant owners, managers and floor staff — mostly non-technical, often
on a phone mid-service, sometimes with very limited experience of software. The
existing UI is organised around the system (menus of features, dense lists,
settings screens). That has proved too complicated for them.

The web app has just shipped **Easy Mode**: an icon-and-colour-driven shell that
runs alongside the existing UI, which users can toggle between. Your job is to
bring the same thing to the Android manager app, so someone switching between
phone and laptop meets the same words, the same groupings and the same icons.

This is a port of a design, not a port of code. Follow the decisions and the
vocabulary; write idiomatic Android.

## The core design decisions (please keep these)

1. **Two modes, one app.** Easy Mode replaces the *navigation shell*, never the
   underlying screens. Do not build a parallel set of screens — one screen, two
   chromes. Anything else drifts apart within a month.

2. **Easy Mode is the default.** Users who prefer the old navigation switch once
   and their choice is remembered on that device. Store it per-device (the web
   uses a cookie; on Android use DataStore/SharedPreferences), not per-account —
   a shared floor tablet and the manager's own phone are different contexts.

3. **One registry is the single source of truth.** Every destination is one entry
   holding: key, plain-language label, one-line description, search synonyms,
   icon, accent colour, section, which roles see it, required permission, and its
   list of primary actions. The launcher grid, the per-screen action bar, the
   search, and the old navigation all read from that one list. Adding a feature
   without adding a registry entry should fail a test.

4. **Every destination gets a tile.** Do not curate a "top 10" — show them all,
   grouped, and let people star favourites and hide what they never use. A café
   and a hotel restaurant want different things on top; don't guess for them.

5. **Landing on a screen shows real data plus a row of big action buttons** —
   not an intermediate menu of menus. The action bar is the core affordance:
   large icon + verb-first label, e.g. `＋ Add a team member`.

6. **Verb-first, one verb per concept, forever.** We "Add" things. Never
   "Create"/"New"/"Register" for the same idea.

## The vocabulary — use these exact words

This wording was chosen deliberately to avoid jargon. Please translate the
*intent*, and keep the plainness; don't revert to the technical names.

### Today's service — "What you need while you're open"
| Tile | Roles | Description |
|---|---|---|
| Overview | owner, staff | A quick look at how today is going |
| Orders | owner, staff | Everything guests have ordered |
| Bookings | owner, staff | Tables guests have reserved |
| Tables | owner | Your rooms, tables and seating |
| Tasks | owner, staff | Checklists and jobs for the team |
| My shifts | staff | When you are working |
| Messages | staff | Notes from your manager and team |
| Till | owner, staff | Open the point of sale screen |
| Kitchen screen | owner, staff | Open the screen the kitchen works from |

### Your place — "Your menu, your team and how you run"
| Tile | Roles | Description |
|---|---|---|
| Menu | owner, staff | Your dishes, drinks and prices |
| Stock | owner, staff | What you have in and what's running low |
| Team | owner, staff | The people who work here |
| Rota | owner, staff | Who works when |
| Hours worked | owner | Clock-ins, clock-outs and absences |
| Opening hours & details | owner | Address, hours, tax details and contact |

### Money & growth — "What you earn and how to grow it"
| Tile | Roles | Description |
|---|---|---|
| Sales & reports | owner | How the business is doing over time |
| Card payments | owner | How guests pay and where money lands |
| Pay | owner | Work out and export what the team is owed |
| Tips | owner | How tips are shared out |
| Offers | owner | Deals and discounts for guests |
| Loyalty | owner, staff | Rewards that bring guests back |
| Reviews | owner | What guests say about you publicly |
| Private feedback | owner | Comments guests send only to you |
| Tax receipts | owner | Official receipts and invoices you've issued |
| Tax setup | owner | How official receipts are issued for your country |

### Setup & extras — "Everything else you can set up"
| Tile | Roles | Description |
|---|---|---|
| Logo & photos | owner | How your place looks to guests online |
| Colours | owner, staff | Colours and style for your guest-facing pages |
| Menu screens | owner, staff | Screens showing your menu in the venue |
| Devices | owner | Tablets and screens paired to this place |
| Tap cards | owner, staff | Cards and stickers guests tap to order |
| Guest WiFi | owner, staff | The network you share with guests |
| Notices | owner | Messages for everyone on the team |
| Hiring | owner | Job adverts and people applying |
| Marketplace | owner | Buy and sell equipment with other venues |
| Things to fix | owner | Setup problems worth sorting out |
| Activity history | owner | Who changed what, and when |
| Close or delete | owner | Pause or permanently remove this business |

Note what these replaced: *Inventory Management → Stock*, *Floor Plan → Tables*,
*Schedule → Rota*, *Staff Management → Team*, *Attendance → Hours worked*,
*NFC Cards → Tap cards*, *Audit Logs → Activity history*, *Danger Zone → Close or
delete*, *Fiscal Invoices → Tax receipts*, *Stations → Devices*.

**Whatever a tile is called, the screen it opens must carry the same name** in
its title bar and in the back stack. A tile called "Stock" opening a screen
headed "Inventory Management" makes people think they tapped the wrong thing.
Enforce this with a test.

## What to build

1. **Home / launcher** — the landing screen in Easy Mode:
   - a "right now" row: orders open, tables busy, team clocked in, sales today;
     each tappable through to the screen that number came from;
   - anything needing attention (setup warnings);
   - the user's starred shortcuts;
   - the full tile grid, grouped into the four sections above. Two columns on a
     phone; large targets (≥48dp); icon + label + the one-line description.
     The description matters as much as the icon — an icon alone is only obvious
     to whoever picked it.
   - a **customise** mode: star to pin, eye to hide. Hidden tiles stay reachable
     through search, so hiding can never lock anyone out of a feature.

2. **Search** — over labels, descriptions **and synonyms**, indexing both screens
   and actions, so "waiter" finds "Add a team member" and "till" finds the POS.
   This is the safety net for when our word isn't their word. Make it reachable
   from the launcher and from the top bar of every screen.

3. **Per-screen action bar** — a row of large icon+verb buttons under the title,
   built from that screen's registry entry, filtered by the user's permissions.
   Two to four primary, the rest behind "More". Examples that exist on web:
   - Team: Add a team member · Who works here · What they can do
   - Tables: Add a table · Add several tables · Add a room
   - Stock: Add a stock item · Import from a file
   - Orders: Orders happening now · All orders

4. **Empty states with an action.** Every list screen, when empty, says what the
   thing is for and offers the one next step — "No stock items yet / Add what you
   keep in and we'll warn you when it runs low / [Add a stock item]". Two rules:
   - **read-only screens get no button** (nobody creates audit entries or tax
     receipts) — a dead-end button is worse than plain text;
   - **an empty list caused by a filter is not an empty business.** Say "Nothing
     matches those filters" with a Clear button instead of "add your first".

5. **Long forms open to the essentials.** Adding a dish should show name,
   description, price, photo — with sizes/options, allergies, kitchen routing,
   stock linking and set-menu membership collapsed behind labelled sections.
   Nothing removed or disabled, only initially hidden. Two rules learned the
   hard way:
   - **expand everything when editing an existing record**, so a populated field
     is never hidden behind a collapsed heading;
   - **don't destroy state when a section collapses** — hide it, keep it alive.

## Pitfalls we hit — please don't repeat them

- **Do not scale an unverified mechanism.** Build the action bar on two or three
  screens, confirm on a real device, then do the rest. We wired ten and found
  the whole mechanism was broken afterwards.
- **Check that deep-link/action values actually match what the screen accepts.**
  Two of our action buttons passed a status value the screen silently ignored,
  so they appeared to work and did nothing. Assert the mapping in a test.
- **Watch for an action that is impossible in context.** "Add a table" when the
  venue has no rooms opened a dialog with nothing to pick. Detect it and offer
  "Add a room first" instead.
- **Check for shared strings before renaming one.** Our "Floor Plan" string was
  also a table column header and a form label; renaming it wholesale would have
  corrupted both.
- **Changing a label users see daily is a real change.** Existing users will see
  "Inventory" become "Stock". That's intended, but worth a release note.

## Definition of done

- Both modes reachable, toggle in the top bar labelled with words, not just an
  icon, and the choice persists across app restarts.
- Every screen in the app has a registry entry; a test fails if one doesn't.
- Tile label, screen title and back-stack label agree; a test fails if they don't.
- Every action-bar button has been tapped on a real phone and does what it says.
- Permission filtering verified with a staff account that has limited permissions.
- All new strings translated into the app's supported languages before release —
  not English-only.

## Questions worth asking before you start

- Does the Android app already have a navigation registry, or is navigation
  scattered across fragments/composables? If scattered, building the registry is
  step one and most of the value.
- Which screens does the Android app *not* have that the web does? Don't show a
  tile for something the app can't open — either build it or leave it out of the
  registry, and say which you chose.
