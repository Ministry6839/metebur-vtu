# Design Brief

## Direction

Terminal Jade — a money-movement terminal for bill payment and data reselling, where every amount reads instantly and every action feels deliberate.

## Tone

Confident, high-contrast fintech utility — cool near-black ink with an electric jade primary; rejects the navy/corporate banking cliché for a modern money-terminal feel.

## Differentiation

A ledger rail: each transaction carries a colored hairline (jade = credit, coral = debit) beside a right-aligned signed amount in tabular mono, so money direction is legible before the number is read.

## Color Palette

| Token      | OKLCH (dark)   | Role   |
| ---------- | -------------- | ------ |
| background | 0.16 0.018 165 | cool near-black ink canvas |
| foreground | 0.95 0.01 165  | primary text |
| card       | 0.2 0.02 165   | elevated surfaces, lists, tables |
| primary    | 0.72 0.16 162  | electric jade — actions, active nav, confirm |
| accent     | 0.72 0.16 162  | jade, used sparingly for emphasis |
| muted      | 0.25 0.022 165 | secondary surfaces, inactive fills |
| credit     | 0.72 0.16 162  | money in — top-ups, refunds |
| debit      | 0.62 0.19 25   | money out — purchases, bill payments |
| warning    | 0.75 0.15 85   | pending / low balance |

Light mode mirrors these with an inverted L scale (background 0.98, foreground 0.17) and a deeper jade primary (0.55 0.15 162).

## Typography

- Display: Space Grotesk — headings, balance hero, section titles; geometric and technical.
- Body: Plus Jakarta Sans — UI labels, list rows, paragraphs; legible at dense sizes.
- Mono: JetBrains Mono — all amounts, phone numbers, references; tabular alignment.
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-sm md:text-base`.

## Elevation & Depth

Flat-to-soft hierarchy: card surfaces on `bg-card` with hairline `border-border`; `shadow-subtle` for resting cards, `shadow-elevated` for modals and the balance hero; no glow or neon.

## Structural Zones

| Zone    | Background        | Border            | Notes                                             |
| ------- | ----------------- | ----------------- | ------------------------------------------------- |
| Header  | `bg-card`         | `border-b`        | search, notifications, user avatar                |
| Sidebar | `bg-sidebar`      | `border-r`        | active item: jade left rail + `bg-sidebar-accent` |
| Content | `bg-background`   | —                 | alternate `bg-muted/30` for section bands         |
| Footer  | `bg-muted/40`     | `border-t`        | legal, support, version                           |

## Spacing & Rhythm

Sections separated by `space-y-8 md:space-y-12`; card grids `gap-4 md:gap-6`; list rows `py-3.5` with `px-4`; micro-spacing in `gap-2` / `gap-1.5` for label-value pairs.

## Component Patterns

- Buttons: `rounded-lg` (12px), jade `bg-primary` for confirm actions, `variant="outline"` for secondary, `variant="ghost"` for tertiary; hover darkens via `transition-smooth`.
- Cards: `rounded-xl` (12px), `bg-card border border-border shadow-subtle`; hover lifts to `shadow-elevated`.
- Badges: `rounded-full`, `bg-credit-muted text-credit` for completed/credit, `bg-debit-muted text-debit` for debit, `bg-muted text-muted-foreground` for neutral/pending.
- Amounts: always `font-mono font-tabular`, right-aligned, prefixed `+`/`−`.

## Motion

- Entrance: `animate-fade-in-up` (0.4s) staggered ~60ms per list item.
- Hover: `transition-smooth` on cards/buttons; subtle translate and shadow lift.
- Decorative: `animate-pulse-soft` on live balance / pending status only; no looping ambient motion.

## Constraints

- No purple, no corporate navy, no full-page gradients.
- Never use raw color literals or arbitrary color classes — semantic tokens only.
- Money direction must be conveyed by sign + color + rail together, never color alone.
- Comfortable density: list rows stay tappable (min 44px) on mobile.
- Support both light and dark themes; dark is the primary expression.

## Signature Detail

The ledger rail — a 3px jade/coral left hairline on every transaction row paired with signed tabular-mono amounts, making the app read as a living account ledger.
