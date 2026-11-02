# Zanger Digital password page

A review-page password screen for Webflow client sites. One script draws the screen over the site's
native password (401) page and moves Webflow's own password form into it, so login still runs through
Webflow's protection (`POST /.wf_auth`). Protected pages stay out of the sitemap and stay locked.

- `zd-password.js`: the whole thing (markup, styles, inline logo, behavior). No iframe, no Zanger
  Digital-hosted assets. The only outside requests are two pinned Fontsource font files on jsDelivr.
- `demo/`: a mock Webflow 401 page and a small server that fakes `/.wf_auth`, for local testing.

## Embed (per client site)

In the Webflow Designer, open the site's **Password** utility page (`/401`), add a **Code Embed** as the
first element in the body, and paste:

```html
<script src="https://mdlambert29.github.io/webflow-password-page/zd-password.js"
  data-clickup="https://app.clickup.com/8666121/v/li/LIST_ID"></script>
```

Publish. Every password-protected page on the site uses this one 401 page.

Before publishing, remove the old build from the 401 page and site: the `.password-page_component`
embed/elements and the footer code that adds the old `#pwFrame` iframe. The new script hides them, but
the old iframe would still load, and the old script would compete for the form.

### Options

Set as `data-*` attributes on the script tag, or as `window.ZDPassword = {...}` in a `<script>` before it.

| Option | Default | What it does |
| --- | --- | --- |
| `clickup` | `https://app.clickup.com/login` | Link on "ClickUp" in step 3, which reads "Open the task in ClickUp." Use any ClickUp URL, e.g. the client's list. |
| `tutorial` | Superflow Loom | "Watch the tutorial (6 min)" link. |
| `heading`, `subheading`, `error` | design copy | Copy overrides. |

One 401 page serves every protected page on a site, so for different ClickUp links per page use the
JS form and map them by path (the protected page's URL stays in the address bar on the 401 page):

```html
<script>
  window.ZDPassword = {
    clickup: {
      "/new-homepage": "https://app.clickup.com/8666121/v/li/AAA",
      "/pricing": "https://app.clickup.com/t/BBB",
      "*": "https://app.clickup.com/8666121/v/li/FALLBACK"   // optional; otherwise the login page
    }
  };
</script>
<script src="https://mdlambert29.github.io/webflow-password-page/zd-password.js"></script>
```

## Hosting on GitHub

The script is served by GitHub Pages from the `main` branch of this public repo:
`https://mdlambert29.github.io/webflow-password-page/zd-password.js`.

**Every push to `main` goes live on every client site** within about a minute (Pages rebuild), plus up
to 10 minutes for visitors' browsers to drop their cached copy (Pages sends `Cache-Control: max-age=600`).
So before pushing:

1. Edit `zd-password.js` and bump `VERSION` in it.
2. Test all three demo pages (see below), including `demo/nested.html`.
3. Commit, tag the version (`git tag v1.3.2`) and push `main` and the tag.

To roll back, revert the commit and push. A tagged version stays available at
`https://cdn.jsdelivr.net/gh/mdlambert29/webflow-password-page@1.3.1/zd-password.min.js` if one site ever
needs to be pinned.

Why not jsDelivr's `@1` URL: it tells browsers to cache the file for 7 days, so a broken release stays in
visitors' browsers for up to a week even after a fix and a CDN purge.

## How it hooks into Webflow

- Waits for Webflow's password form (`.w-password-page.w-form`), then moves the whole wrapper into the
  overlay. The input (`name="pass"`), hidden `path`/`page` fields and form action are untouched.
- Webflow redirects back with `?e=1` after a wrong password. The script shows the native
  `.w-form-fail` message (reworded) and the red error state.
- What it changes on the native form: the button text ("Unlock Page"), the error text, removes the
  placeholder, hides the form's own image/heading/label, and adds a Show/Hide toggle.
- What can't change: the form must stay a Webflow password form posting to `/.wf_auth`, and the 401 page
  is shared by all protected pages on a site.
- Everything else on the 401 page is hidden while the overlay is up. If the script loads before the
  form, it holds the page's paint (at most 3s) so the default page never flashes.

## Testing locally

```bash
node demo/server.js
```

Test password: `review`. Anything else redirects with `?e=1`, like Webflow.

- http://localhost:4173: Webflow's default form, script in `<head>` with data attributes.
- http://localhost:4173/demo/footer.html: script at the end of the body, JS config.
- http://localhost:4173/demo/nested.html: a customized client form (field and button inside the
  site's own wrapper, a fake button, extra links), copied from a live client site. Check this one
  after any change to how the form is adopted.

If the script ever fails on a site's form, it logs `[zd-password] Could not draw the password page`
in the console and leaves the site's own password page in place.
