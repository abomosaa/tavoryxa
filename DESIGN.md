---
name: Tavoryxa
description: A bilingual stationery storefront in warm paper, paprika, and illustrated desk materials.
colors:
  paper: '#f7f3eb'
  ink: '#292820'
  accent: '#a5442d'
  muted: '#69675d'
  line: '#dcd7cb'
  sage: '#dce1d6'
  soft: '#eee8dc'
typography:
  display-ar:
    fontFamily: 'Noto Sans Arabic, DM Sans, sans-serif'
    fontSize: 'clamp(36px,3.8vw,59px)'
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: '-1.5px'
  display-en:
    fontFamily: 'Georgia, serif'
    fontSize: 'clamp(43px,4.5vw,67px)'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '-2px'
  title-ar:
    fontFamily: 'Noto Sans Arabic, DM Sans, sans-serif'
    fontSize: '29px'
    fontWeight: 600
    lineHeight: 1.7
    letterSpacing: '-.6px'
  title-en:
    fontFamily: 'Georgia, serif'
    fontSize: '35px'
    fontWeight: 400
    lineHeight: 1.3
  product-title:
    fontFamily: 'Noto Sans Arabic, DM Sans, sans-serif'
    fontSize: '14px'
    fontWeight: 600
    lineHeight: 1.8
rounded:
  control: '3px'
  modal: '4px'
spacing:
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  xxl: '32px'
  section: '40px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '#fffaf1'
    rounded: '{rounded.control}'
    padding: '12px 24px'
  button-secondary:
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  input:
    backgroundColor: '#fffaf0'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '10px 14px'
  modal:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.modal}'
    padding: '26px'
---

# Design System: Tavoryxa

## Overview

**Creative North Star: "The Warm Stationery Shelf"**

Warm paper, paprika ink, and pale desk materials frame an editorial browsing experience. Local source-native SVG still lifes establish the product world; familiar controls keep cart and simulated checkout practical. This is an original fictional identity, with shadcn research informing control discipline only.

**Key Characteristics:**

- Warm paper and restrained paprika contrast.
- Illustrated desk objects with generous breathing room.
- Arabic-first typography with an English editorial serif.

## Colors

### Primary

Paprika marks primary actions, selected categories, and emphasized words.

### Neutral

Paper forms the page; charcoal provides text; muted ink supports descriptions; pale rules divide sections. Soft material backgrounds support fields and product-related surfaces. Sage provides a quiet confirmation fill. Exact source values are normative in frontmatter.

**The Material Field Rule.** Give product illustrations calm tonal fields rather than decorative interface shadows.

## Typography

Self-hosted Noto Sans Arabic leads Arabic and DM Sans leads English UI. Georgia is used for English editorial display and section headings; English dialog headings remain DM Sans. The normative display and title roles are above. Product names are compact and prices use tabular numerals. Arabic paragraphs keep generous line height; mobile story and hero body copy remain readable at 14px.

**The Language Role Rule.** Keep the serif in English editorial headings while Arabic and operational controls use their established sans families.

## Layout

The desktop container is bounded at 1280px with a 96px total gutter, narrowing to 56px below 1100px and 36px below 750px. Desktop hero and story compositions use two columns. The product grid has four columns, becoming two below 750px; hero, story, detail, and checkout grids become single-column. Mobile hides desktop navigation while retaining language, account, and bag controls.

**The Direction Rule.** Arabic RTL and English LTR share logical spacing and start/end alignment; illustrated still-life compositions retain their intended object orientation.

## Elevation & Depth

Page sections and product cards are flat and divided by fine rules. Modals use `0 24px 80px #29282033` with a dark backdrop and 3px blur. Toasts use `0 8px 25px #29282026`. These overlay shadows are not card styles.

## Shapes

Most illustrated media and product fields are square-cornered. Controls use the small radius above; modals are only slightly softened. Bag counts and success marks are circular. Avoid applying dashboard-style rounded cards to the catalogue.

## Components

Primary buttons have a paprika fill, warm white text, 48px minimum height, a darker hover, and 1px hover lift. Secondary buttons use a fine border and soft hover fill. Inputs use a warm field fill and visible stroke. Keyboard focus uses a 2px paprika outline with a 4px offset.

Category navigation uses a written active label and underline. Product cards combine SVG illustration, name, description, amount, and a separate add control. Desktop product art scales gently on hover and reveals a detail affordance; mobile preserves direct product actions. Native dialogs adapt to available height. Motion uses 180ms control feedback and 280ms image scaling; reduced motion removes transitions and animation.

## Do's and Don'ts

- Do preserve Arabic-first RTL and complete English layouts.
- Do present the local SVG objects as illustrations.
- Do keep cart totals and checkout actions easy to scan.
- Don't add decorative shadows to product cards.
- Don't imply real payment, shipping, testimonials, or sales from the fictional demo.
