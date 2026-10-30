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
<script src="https://cdn.jsdelivr.net/gh/mdlambert29/webflow-password-page@1/zd-password.min.js"
  data-slack="https://zangerdigital.slack.com/archives/CLIENT_CHANNEL_ID"
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
| `slack` | `https://app.slack.com/client` | "Message us in Slack" link. |
| `clickup` | none | Step 3 link. A list link (`.../v/li/...`) reads "Find the page's task in our ClickUp list." A task link (`.../t/...`) reads "In the page's ClickUp task." Without it, step 3 reads "In the ClickUp task we sent you." |
| `tutorial` | Superflow Loom | "Watch the tutorial (6 min)" link. |
| `heading`, `subheading`, `error` | design copy | Copy overrides. |

One 401 page serves every protected page on a site, so for different ClickUp lists or tasks per page use the
JS form and map them by path (the protected page's URL stays in the address bar on the 401 page):

```html
<script>
  window.ZDPassword = {
    slack: "https://zangerdigital.slack.com/archives/CLIENT_CHANNEL_ID",
    clickup: {
      "/new-homepage": "https://app.clickup.com/8666121/v/li/AAA",
      "/pricing": "https://app.clickup.com/t/BBB",
      "*": "https://app.clickup.com/8666121/v/li/FALLBACK"   // optional
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/mdlambert29/webflow-password-page@1/zd-password.min.js"></script>
```

## Hosting on GitHub

1. Create a **public** GitHub repo (jsDelivr only serves public repos) and push this folder.
2. Tag a release: `git tag v1.0.0 && git push --tags`.
3. Use `https://cdn.jsdelivr.net/gh/mdlambert29/webflow-password-page@1/zd-password.min.js` in the embed. jsDelivr minifies
   `.min.js` automatically, and `@1` follows the newest `v1.x.x` tag.

To ship a change to every site: edit `zd-password.js`, bump `VERSION` in it, then tag `v1.0.1` (etc.)
and push. jsDelivr can cache `@1` for up to a day; to make it immediate, open
`https://purge.jsdelivr.net/gh/mdlambert29/webflow-password-page@1/zd-password.min.js` once. For a breaking change, tag
`v2.0.0`, so sites stay on `@1` until you move them.

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

Open http://localhost:4173 (script in `<head>`, data attributes) or
http://localhost:4173/demo/footer.html (script at end of body, JS config). Test password: `review`.
Anything else redirects with `?e=1`, like Webflow.
