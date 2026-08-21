# Biscuit Bliss — website

A static, single-page site for **Biscuit Bliss** (@biscuitbliss), a homemade
butter-biscuit bakery in Durban, South Africa.

Everything on the page — logo, photography, flavour names, product copy and the
"Nothing Beats Homemade" tagline — is sourced from the business's own Instagram
account. No build step, no dependencies, no framework.

## Run it

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` in a browser (the tub builder's clipboard copy needs
`http://` or `https://` to work, so prefer the server).

## Files

```
index.html        the whole page
css/style.css     brand tokens + all styling (hand-written, no framework)
js/app.js         nav, scroll reveals, flavour rail, tub builder
img/              logo, favicons and all product photography
```

## Brand tokens

Colours were sampled directly from the source imagery, not guessed:

| Token          | Value     | Sampled from                          |
|----------------|-----------|---------------------------------------|
| `--pink`       | `#FB558B` | the round Instagram profile logo      |
| `--pink-ink`   | `#E4398F` | the printed pink oval on tub labels   |
| `--teal`       | `#0295A5` | the "Butter Biscuits" band on labels  |
| `--cream`      | `#FBF5EC` | page paper                            |
| `--ink`        | `#2E1D14` | text / dark sections                  |

Type: **Fraunces** (display), **Instrument Sans** (text), **Yellowtail**
(script accent, echoing the logo's hand-lettered wordmark). Loaded from Google
Fonts.

## The tub builder

`#build` lets a visitor pick up to four varieties. On submit it copies a
formatted order message to the clipboard and opens the Instagram profile so they
can paste it into a DM. Varieties live in the `VARIETIES` array at the top of
the tub-builder block in `js/app.js` — edit that one list to change what is
offered.

## Things the owner should fill in

These were deliberately left out rather than invented:

- **Prices.** Nothing on the page quotes a price; the copy directs people to DM
  for the current list. Add a price section once the list is confirmed.
- **WhatsApp / phone.** No number was published on the Instagram account, so the
  only order channel wired up is Instagram DM. To add WhatsApp, drop a
  `https://wa.me/<number>` link next to the Instagram buttons in the nav, the
  tub builder and the closing CTA.
- **Collection / delivery details** and trading days.
- **Real domain** — update the `og:image` and `canonical` tags in `<head>` once
  the site has one.

## Notes

- Responsive from ~320px up; single breakpoints at 920px, 860px and 820px.
- Respects `prefers-reduced-motion` (marquee, reveals and smooth scrolling all
  stand down).
- Images are WebP at two widths (`-sm` = 600px, full = 1200px) and lazy-loaded
  below the fold.
- All photography © Biscuit Bliss.
