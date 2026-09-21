# Tutorial Video Skill — Scope

Status: **scoped, not built.** Written 2026-09-21.

Goal: a `/tutorial` skill that renders Firebase-style tutorial videos for FlairSync features —
branded logo bumper, title card, step-by-step walkthrough over real UI, recap, CTA — with
voiceover, in `ca` / `en` / `es-ES`.

---

## Locked decisions

| Decision | Choice |
|---|---|
| Render engine | **Remotion** (React compositions) |
| Capture | **Playwright screenshots + animated zoom/pan** (not live video recording) |
| Demo environment | **Seeded local demo business** |
| TTS provider | **Deferred.** Pipeline ships with a stub provider; real provider plugged in later |
| Languages | `ca`, `en`, `es-ES`. **`fr-FR` explicitly out of scope.** |

---

## What already exists (verified)

This is the reason the skill is small: **the scripts are already written and already translated.**

- [`components/tutorials/data.ts`](../../components/tutorials/data.ts) — `TUTORIAL_PARTS`: 21 parts, 66 sections,
  each with `{ id, slug }` (e.g. `{ id: "4.3", slug: "4-3" }`).
- `public/locales/<lng>/tutorials.json` — all 66 sections present in **`en`, `ca`, and `es-ES`**
  (46KB / 41KB / 41KB respectively). Section shape:

  ```jsonc
  "1-1": {
    "title": "Creating Your Account",
    "whatItIs": "Register and verify your identity so you can access the platform.",
    "whoUsesIt": "Anyone new to FlairSync.",
    "stepGroups": [ { "steps": ["Click Sign Up on the login page.", "..."] } ],
    "tips": ["The verification code expires in 10 minutes. ..."],
    "appRouteLabel": "Sign Up Now"
  }
  ```

- Consumers today: [`pages/learn/+Page.tsx`](../../pages/learn/+Page.tsx),
  [`components/learn/TutorialContent.tsx`](../../components/learn/TutorialContent.tsx),
  `TutorialSidebar.tsx`.
- Brand assets: `public/logo.svg`, `public/logo-mark.svg`, `public/fs_logo.svg`.
- Language switching: the **`fs_lang` cookie** ([`utils/cookies.ts:4`](../../utils/cookies.ts#L4)).

### Content model maps 1:1 onto Firebase-video beats

| `tutorials.json` field | Video beat |
|---|---|
| — | logo bumper (`logo-mark.svg` animate-in) |
| `title` | title card |
| `whatItIs` + `whoUsesIt` | "what you'll learn / who this is for" opener |
| `stepGroups[].steps[]` | one narrated scene per step — the walkthrough body |
| `tips[]` | recap / gotchas outro |
| `appRouteLabel` | end-card CTA |

No script generation needed. The skill **renders an existing localized corpus**.

---

## Known gaps to close before first render

1. **No slug → route map.** `appRouteLabel` exists but there is no `appRoute` key on any section
   (0 of 66), and `TutorialContent.tsx` never reads it. This registry is the main authoring surface — see below.
2. **ffmpeg is not installed** on the dev box. `sudo apt install ffmpeg`. Remotion cannot render without it.
3. **No Playwright** in `package.json`. Add `@playwright/test` as a devDependency.
4. **No demo-business seeder.** The only existing seeds are TypeORM migrations for *platform reference data*
   (permissions, packs, allergies, business tags) — nothing that creates a business with menu/tables/staff/orders.
5. **No TTS binary** available locally (no `espeak-ng`, `piper`, `say`). Hence the stub provider.

---

## Pipeline

```
/tutorial 4-3 --lang ca

1. Resolve   TUTORIAL_PARTS + tutorials.json[lng].sections["4-3"]
2. Route     tutorials/routes.ts → URL + per-step interaction script
3. Capture   Playwright: fs_lang=ca, authed against seeded demo business
             per step → full-res PNG + focus-element bounding box
4. Narrate   TTS per step → vo/<lang>/step-NN.wav  (stub: silent WAV of estimated duration)
5. Compose   Remotion reads capture manifest + vo dir
6. Render    tutorials-output/4-3/ca/tutorial.mp4 + tutorial.vtt
```

**Capture runs once per language.** The FlairSync UI is itself translated, so a Catalan tutorial
must show Catalan UI. At full scope that is 66 sections × 3 languages = 198 renders — which is why
this is phased.

---

## Data contracts

### Route registry — `tutorials/routes.ts` (new, the authoring surface)

```ts
export interface TutorialStepScript {
  group: number;   // index into stepGroups
  index: number;   // index into stepGroups[group].steps — keeps narration aligned
  action:
    | { type: "goto"; url: string }
    | { type: "click"; selector: string }
    | { type: "fill"; selector: string; value: string }
    | { type: "hover"; selector: string }
    | { type: "wait"; selector?: string; ms?: number }
    | { type: "none" };
  focus?: string;  // selector to zoom/highlight; falls back to the action target
}

export interface TutorialRoute {
  slug: string;                              // matches TUTORIAL_PARTS
  entryUrl: string;                          // may contain :businessId
  auth: "anonymous" | "owner" | "staff";
  steps: TutorialStepScript[];
}
```

Authored per section. I can draft entries from the route map in `CLAUDE.md` plus the `steps[]` text,
but they need human correction — this is the part that cannot be fully automated.

### Capture manifest — emitted per (slug, lang)

```jsonc
{
  "slug": "4-3",
  "lang": "ca",
  "viewport": { "w": 1920, "h": 1080 },
  "title": "…",           // resolved from tutorials.json[lang]
  "whatItIs": "…",
  "whoUsesIt": "…",
  "tips": ["…"],
  "ctaLabel": "…",
  "shots": [
    {
      "group": 0, "index": 0,
      "file": "shots/step-00.png",
      "focus": { "x": 412, "y": 280, "w": 340, "h": 96 },
      "caption": "Fes clic a Registra't a la pàgina d'inici de sessió.",
      "vo": "vo/step-00.wav",
      "voDurationMs": 3200
    }
  ]
}
```

Remotion consumes only this manifest. That keeps capture, narration, and composition
independently replaceable.

### TTS provider interface (stubbed for now)

```ts
export interface TtsProvider {
  name: string;
  synthesize(text: string, lang: "ca" | "en" | "es-ES", outPath: string): Promise<{ durationMs: number }>;
}
```

Ship `StubTtsProvider`: writes a silent WAV whose length is estimated from word count
(~150 wpm, tuned per language). The timeline is therefore **real and correctly paced**, and the video
renders with burned-in captions. Swapping in a real provider later changes durations only —
no pipeline changes. Real-provider candidates for Catalan, for when that happens:
Azure Neural (`ca-ES-JoanaNeural`/`EnricNeural`/`AlbaNeural`, commercially clean, cheap),
ElevenLabs (best quality, priciest), or Matxa/alVoCat from Projecte AINA
(open, multi-dialect, but **non-commercial licence** — needs voice-artist licensing for marketing use).

---

## Proposed directory layout

```
tutorials/                        # new, repo root
  routes.ts                       # the route registry
  capture/                        # Playwright capture runner
    seed.ts                       # demo-business seeder (API-driven)
    auth.ts                       # login + session for owner/staff
    run.ts
  tts/
    provider.ts                   # TtsProvider interface
    stub.ts                       # silent-WAV placeholder
  remotion/
    Root.tsx
    Tutorial.tsx                  # composition: bumper → title → steps → tips → CTA
    scenes/
      LogoBumper.tsx
      TitleCard.tsx
      StepScene.tsx               # zoom/pan to focus box, cursor, highlight ring, caption
      TipsCard.tsx
      EndCard.tsx
tutorials-output/<slug>/<lang>/   # gitignored
```

Placed at repo root, not under `features/` or `components/` — this is build tooling, not app code,
so the two hard placement rules in `CLAUDE.md` do not apply to it.

---

## Seeding

API-driven rather than DB-level: a script that signs up a demo user, creates a demo business, and
populates menu, tables/floor plan, staff, and a few orders through the real endpoints via `flairapi`.
Slower than SQL fixtures but stays correct as the API evolves, and exercises the same paths a real
user would. Output is a stable `businessId` written to a local file for `routes.ts` to interpolate
into `entryUrl`.

---

## Phasing

**Phase 1 — vertical slice (goal: a video on screen).**
Install ffmpeg + Playwright + Remotion. Build the manifest contract, the stub TTS, and the Remotion
composition. Hand-author `routes.ts` for **one** section — `1-1` (Creating Your Account) is the right
pick: it is `auth: "anonymous"`, so it needs **no seeder at all**. Render `1-1` in `en` and `ca`.

**Phase 2 — seeder + authed sections.** Build the demo seeder, then extend to 2–3 owner-scoped
sections to prove authed capture works.

**Phase 3 — scale.** Draft `routes.ts` for the remaining sections, batch-render, wire real TTS.

Phase 1 is the only phase worth committing to before seeing output.
