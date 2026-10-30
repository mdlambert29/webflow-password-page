/*!
 * Zanger Digital password page v1.0.0
 * Draws the review-page password screen over a Webflow site's native password (401) page and moves
 * Webflow's own password form into it, so login still goes through Webflow (POST /.wf_auth).
 * Self-contained: markup, styles and the logo are built in. The only outside requests are the two
 * pinned Fontsource font files on jsDelivr.
 *
 * Embed (on the site's 401 password page):
 *   <script src="https://cdn.jsdelivr.net/gh/mdlambert29/webflow-password-page@1/zd-password.min.js"
 *     data-slack="https://..." data-clickup="https://..."></script>
 *
 * Options, as data-* attributes on the script tag or as window.ZDPassword = {...} set before it:
 *   slack     Link for "Message us in Slack".
 *   clickup   Link for the step 3 ClickUp task. With JS config it can also be an object keyed by
 *             protected page path, e.g. { "/pricing": "https://...", "*": "https://..." }.
 *             Without a link, step 3 reads "In the ClickUp task we sent you."
 *   tutorial  Link for "Watch the tutorial (6 min)". Defaults to the Superflow Loom.
 *   heading, subheading, error   Copy overrides.
 */
(function () {
  'use strict';
  if (window.__zdPasswordPage) return;
  window.__zdPasswordPage = true;

  var VERSION = '1.0.0';
  var FONTS = 'https://cdn.jsdelivr.net/npm/@fontsource/';
  var script = document.currentScript;
  var data = (script && script.dataset) || {};
  var js = window.ZDPassword || {};

  function opt(name, fallback) {
    var v = js[name] != null ? js[name] : data[name];
    return v != null && v !== '' ? v : fallback;
  }
  // Only http(s) and mailto links get through, so a typo'd or hostile value can't become javascript:
  function safeUrl(u) {
    if (typeof u !== 'string' || !u) return null;
    try {
      var url = new URL(u, location.href);
      return /^(https?|mailto):$/.test(url.protocol) ? url.href : null;
    } catch (e) { return null; }
  }
  // One 401 page serves every protected page on a site, so ClickUp links can be mapped by path
  function pickByPath(v) {
    if (!v || typeof v !== 'object') return v;
    var p = location.pathname;
    return v[p] || v[p.replace(/\/$/, '')] || v[p + '/'] || v['*'] || null;
  }

  var cfg = {
    slack: safeUrl(opt('slack', 'https://app.slack.com/client')),
    clickup: safeUrl(pickByPath(opt('clickup', null))),
    tutorial: safeUrl(opt('tutorial', 'https://www.loom.com/share/9cd65d63e7954642994d00b63ebad806')),
    heading: opt('heading', 'Your page is ready for review'),
    subheading: opt('subheading', 'Unlock it, leave comments in Superflow, then send it back or accept it in ClickUp.'),
    error: opt('error', 'That password didn’t work. Check it and try again, or ask us in Slack.')
  };

  /* ---------- Styles ---------- */

  var CSS = `
@font-face{font-family:'ZD Sans';src:url(${FONTS}open-sauce-sans@5.3.0/files/open-sauce-sans-latin-400-normal.woff) format('woff');font-weight:400;font-display:swap}
@font-face{font-family:'ZD Sans';src:url(${FONTS}open-sauce-sans@5.3.0/files/open-sauce-sans-latin-500-normal.woff2) format('woff2');font-weight:500;font-display:swap}
@font-face{font-family:'ZD Sans';src:url(${FONTS}open-sauce-sans@5.3.0/files/open-sauce-sans-latin-600-normal.woff2) format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'ZD Sans';src:url(${FONTS}open-sauce-sans@5.3.0/files/open-sauce-sans-latin-700-normal.woff2) format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'ZD Display';src:url(${FONTS}host-grotesk@5.3.0/files/host-grotesk-latin-700-normal.woff2) format('woff2');font-weight:700;font-display:swap}

/* Hide the page until the overlay is in, so the default password page never flashes */
html.zdpw-wait body{visibility:hidden}
/* Once in, the overlay is the whole page: everything else on the 401 page is hidden */
html.zdpw-on,html.zdpw-on body{overflow:hidden!important;background:#000319!important}
html.zdpw-on body>:not(#zdpw){display:none!important}

#zdpw{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;-webkit-overflow-scrolling:touch;color-scheme:dark;
  background-color:#000319;background-image:radial-gradient(ellipse 60% 40% at 50% 0%,rgba(26,79,255,.16),transparent 70%),radial-gradient(ellipse 45% 35% at 12% 0%,rgba(65,108,253,.12),transparent 70%),radial-gradient(ellipse 45% 35% at 88% 0%,rgba(65,108,253,.12),transparent 70%);
  color:#fff;font-family:'ZD Sans','Open Sauce Sans',Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;-webkit-font-smoothing:antialiased}
/* Guard against the client site's global tag styles */
#zdpw,#zdpw *,#zdpw *::before,#zdpw *::after{box-sizing:border-box}
#zdpw h1,#zdpw p,#zdpw ol,#zdpw li,#zdpw a,#zdpw label{letter-spacing:normal;text-transform:none;font-family:inherit}
#zdpw ol,#zdpw li{list-style:none;margin:0;padding:0}
#zdpw li::before,#zdpw li::marker{content:none}

#zdpw .zdpw-page{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(1.25rem,3.2vh,2rem);padding:clamp(1.25rem,3.5vh,2.25rem) clamp(1.25rem,4vw,3rem)}
#zdpw .zdpw-logo{display:block;width:115px;height:40px;line-height:0}
#zdpw .zdpw-logo svg{display:block;width:115px;height:40px}
#zdpw .zdpw-main{width:100%;max-width:60rem;display:flex;flex-direction:column;align-items:center;gap:clamp(1.25rem,3.2vh,2rem)}
#zdpw .zdpw-intro{text-align:center}
#zdpw .zdpw-heading{margin:0;font-family:'ZD Display',Hostgrotesk,Arial,sans-serif;font-weight:700;font-size:clamp(2rem,1.4rem + 1.8vw,2.75rem);line-height:1.1;color:#fff;text-wrap:balance}
#zdpw .zdpw-sub{margin:.75rem auto 0;max-width:38rem;font-size:1.0625rem;line-height:1.6;color:#A7ADBE;text-wrap:balance}

#zdpw .zdpw-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;width:100%}
#zdpw .zdpw-step{display:flex;flex-direction:column;gap:.75rem;min-width:0}
#zdpw .zdpw-scene{position:relative;width:100%;aspect-ratio:16/8.6;overflow:hidden;border-radius:16px;container-type:inline-size;
  background-color:#00041F;border:1px solid rgba(255,255,255,.08);background-image:radial-gradient(circle,rgba(255,255,255,.10) 1.1px,transparent 1.5px);background-size:12px 12px}
#zdpw .zdpw-scene>*{position:absolute}
#zdpw .zdpw-sheen{inset:0;background:linear-gradient(118deg,rgba(255,255,255,.055) 0%,rgba(255,255,255,.02) 28%,transparent 55%)}
#zdpw .zdpw-card{box-sizing:border-box;display:flex;flex-direction:column;background:#0C1027;border:1px solid rgba(255,255,255,.08);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.45)}
#zdpw .zdpw-bar{border-radius:999px;background:rgba(255,255,255,.06)}
#zdpw .zdpw-pin{width:7cqw;height:7cqw;display:flex;align-items:center;justify-content:center;border-radius:50% 50% 50% 0;background:#fff;box-shadow:0 0 0 1.2cqw rgba(110,149,247,.25);font-size:3.6cqw;font-weight:700;color:#000319;line-height:1}
#zdpw .zdpw-cursor{width:6cqw;height:6cqw;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))}
#zdpw .zdpw-choice{position:relative;display:flex;align-items:center;gap:3cqw;padding:3.4cqw 4cqw;border-radius:10px;font-size:4.6cqw;font-weight:600;line-height:1.2}
#zdpw .zdpw-choice svg{flex:none;width:6cqw;height:6cqw}

#zdpw .zdpw-caption{display:flex;align-items:flex-start;gap:.625rem;min-width:0}
#zdpw .zdpw-caption-text{min-width:0}
#zdpw .zdpw-badge{flex:none;width:1.75rem;height:1.75rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#1C2354;font-size:.875rem;font-weight:700;line-height:1;color:#8ABFF5}
#zdpw .zdpw-badge.is-current{border-color:#4D65FF;color:#fff}
#zdpw .zdpw-step-title{margin:.125rem 0 0;font-size:1rem;line-height:1.4;font-weight:600;color:#fff}
#zdpw .zdpw-step-text{margin:.125rem 0 0;font-size:1rem;line-height:1.45;color:#A7ADBE}
/* Links: 44px tall hit area without changing the layout */
#zdpw .zdpw-link{display:inline-block;padding:.625rem 0;margin:-.625rem 0;font-weight:600;color:#8ABFF5;text-decoration:none;background:none}
#zdpw .zdpw-step-text .zdpw-link{display:inline;padding:0;margin:0}
#zdpw .zdpw-link.is-video{display:inline-flex;align-items:center;gap:.375rem}
#zdpw .zdpw-link.is-video svg{flex:none;width:16px;height:16px}

#zdpw .zdpw-form-area{width:100%;max-width:34rem;min-height:5.9rem}
#zdpw .zdpw-label{display:block;margin:0 0 .5rem;font-size:.875rem;font-weight:500;line-height:1.5;color:#C4C8D4}
#zdpw .zdpw-help{margin:0;text-align:center;font-size:1rem;line-height:1.5;color:#A7ADBE}

/* Webflow's native password form, restyled in place */
#zdpw .w-password-page.w-form{display:block;margin:0;padding:0;width:100%;max-width:none;min-width:0;text-align:left;background:none;border:0;box-shadow:none;position:static;transform:none}
#zdpw form.w-password-page{display:flex;flex-direction:column;margin:0;padding:0;width:100%;max-width:none;background:none;border:0;box-shadow:none;gap:0}
#zdpw form.w-password-page>:is(img,h1,h2,h3,h4,h5,h6,label,p){display:none}
#zdpw .w-password-page.w-form-fail{order:-1;margin:0 0 .625rem;padding:0;background:transparent;border:0;color:#F04438;font-family:inherit;font-size:.875rem;line-height:1.5;text-align:left}
#zdpw .w-password-page.w-form-fail>div{display:flex;align-items:flex-start;gap:.5rem}
#zdpw .w-password-page.w-form-fail>div::before{content:"";flex:none;width:18px;height:18px;margin-top:1px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F04438' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7.5v5M12 16.25v.01'/%3E%3C/svg%3E") no-repeat center/contain}
#zdpw .zdpw-shell{display:flex;gap:.375rem;padding:.375rem;background:#0C1027;border:1px solid #6D7792;border-radius:16px}
#zdpw .zdpw-shell:focus-within{outline:2px solid #4D65FF;outline-offset:2px}
#zdpw .zdpw-field{position:relative;flex:1 1 auto;min-width:0}
#zdpw input.w-password-page.w-input{display:block;width:100%;height:3.25rem;margin:0;padding:0 4.5rem 0 .75rem;background:transparent;border:0;border-radius:12px;box-shadow:none;color:#fff;font-family:inherit;font-size:1rem;line-height:normal}
#zdpw input.w-password-page.w-input:focus{outline:none}
#zdpw input::-ms-reveal,#zdpw input::-ms-clear{display:none}
#zdpw .zdpw-toggle{position:absolute;top:.25rem;right:.25rem;height:2.75rem;min-width:3.75rem;margin:0;padding:0 .75rem;background:transparent;border:0;border-radius:8px;color:#8ABFF5;font-family:inherit;font-size:.875rem;font-weight:600;line-height:1;cursor:pointer}
#zdpw input.w-password-page.w-button{flex:none;min-width:10rem;width:auto;height:3.25rem;margin:0;padding:0 1.5rem;border:0;border-radius:12px;background:linear-gradient(180deg,#416CFD 0%,#083CE9 83%);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.45),inset 0 0 0 1px rgba(255,255,255,.12);color:#fff;font-family:inherit;font-size:.9375rem;font-weight:600;line-height:1;cursor:pointer;-webkit-appearance:none;appearance:none;transition:background .4s cubic-bezier(.33,1,.68,1),color .4s cubic-bezier(.33,1,.68,1),transform .16s ease-out}
#zdpw input.w-password-page.w-button:active{transform:scale(.97)}
#zdpw .is-error .zdpw-shell{border-color:#F04438;box-shadow:0 0 0 3px rgba(240,68,56,.18)}
#zdpw a:focus-visible,#zdpw button:focus-visible,#zdpw input.w-button:focus-visible{outline:2px solid #4D65FF;outline-offset:3px}
@media (hover:hover) and (pointer:fine){
  #zdpw a:hover{color:#CCD8FF}
  #zdpw input.w-password-page.w-button:hover{background:#fff;color:#00041F}
}

@media (max-width:767px){
  #zdpw .zdpw-steps{grid-template-columns:minmax(0,1fr);row-gap:.75rem}
  #zdpw .zdpw-step{flex-direction:row;align-items:center;gap:.875rem}
  #zdpw .zdpw-scene{width:6.5rem;flex:none;aspect-ratio:16/10}
  #zdpw .zdpw-sub{display:none}
}
@media (max-width:479px){
  #zdpw .zdpw-shell{flex-direction:column;gap:.75rem;padding:0;background:transparent;border:0}
  #zdpw .zdpw-shell:focus-within{outline:none}
  #zdpw input.w-password-page.w-input{background:#0C1027;border:1px solid #6D7792;padding-left:1rem}
  #zdpw input.w-password-page.w-input:focus{outline:2px solid #4D65FF;outline-offset:2px}
  #zdpw .is-error input.w-password-page.w-input{border-color:#F04438}
  #zdpw .is-error .zdpw-shell{box-shadow:none}
  #zdpw input.w-password-page.w-button{width:100%}
  #zdpw .zdpw-form-area{min-height:9rem}
}
/* One screen on short viewports */
@media (min-width:768px) and (max-height:760px){
  #zdpw .zdpw-sub{display:none}
  #zdpw .zdpw-scene{aspect-ratio:16/7.2}
}
@media (max-width:767px) and (max-height:700px){
  #zdpw .zdpw-scene{display:none}
  #zdpw .zdpw-page,#zdpw .zdpw-main{gap:1rem}
  #zdpw .zdpw-heading{font-size:1.75rem}
}
@media (prefers-reduced-motion:reduce){
  #zdpw *{transition:none!important}
}`;

  /* ---------- Markup (static; config values are set through the DOM below) ---------- */

  var CURSOR = '<path d="M5 2l14 9.5-6.5 1.2 3.8 7-2.7 1.4-3.8-7L5 19z" fill="#FFFFFF" stroke="#131839" stroke-width="1.2"/>';

  var LOGO = '<svg role="img" aria-label="Zanger Digital" viewBox="0 0 200 70" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Zanger Digital</title><path fill-rule="evenodd" clip-rule="evenodd" d="M18.1724 9.34002L11.9936 24.5389C11.7493 25.1394 10.7297 25.0337 10.7297 24.2446V9.34002H18.1724ZM71.3278 0.000622901L68.2276 0H4.49809H1.39844V3.10401V66.8966V70H4.49809H68.2276H70.0212H71.3278V66.8966V3.10401V0.000622901ZM2.94827 1.55263H69.7769L69.7773 68.4481H2.94827V1.55263ZM54.5532 60.6599L60.7327 45.4611C60.9771 44.8606 61.9966 44.9665 61.9966 45.7554V60.6595L54.5532 60.6599ZM64.2164 8.29518C64.6325 7.77183 65.4475 8.28337 65.0348 8.92245L31.6118 60.6599H22.5813L64.2164 8.29518ZM60.5984 28.3182L47.4496 60.6599H38.6813L59.8562 27.8806C60.1036 27.4973 60.8106 27.7962 60.5984 28.3182ZM8.50849 61.7054C8.09261 62.2287 7.2776 61.7173 7.6904 61.0782L41.1134 9.34062H50.1437L8.50849 61.7054ZM12.1266 41.6826L25.2756 9.34062H34.0443L12.8695 42.1198C12.6221 42.5033 11.9146 42.2038 12.1266 41.6826Z" fill="white"/><path d="M92.9965 27.8222L102.736 16.0368V13.364H87.758V16.7241H97.3194L87.5547 28.5096V31.1822H103.117V27.8222H92.9965ZM119.058 31.1822H123.382L115.422 13.364H111.353L103.42 31.1822H107.641L109.217 27.3641H117.482L119.058 31.1822ZM110.54 24.2331L113.362 17.4113L116.185 24.2331H110.54ZM137.485 13.364V24.1822L128.636 13.364H125.228V31.1822H129.297V20.3641L138.172 31.1822H141.553V13.364H137.485ZM157.794 27.2113C156.751 27.7713 155.709 27.9749 154.59 27.9749C151.181 27.9749 148.816 25.6076 148.816 22.2731C148.816 18.8876 151.181 16.5713 154.64 16.5713C156.446 16.5713 157.946 17.2076 159.243 18.5822L161.888 16.1386C160.159 14.1276 157.565 13.0586 154.437 13.0586C148.766 13.0586 144.647 16.9022 144.647 22.2731C144.647 27.6441 148.766 31.4876 154.36 31.4876C156.903 31.4876 159.6 30.6986 161.558 29.2223V21.9931H157.794V27.2113ZM169.478 27.8731V23.7496H177.742V20.5422H169.478V16.6731H178.836V13.364H165.383V31.1822H179.166V27.8731H169.478ZM198.209 31.1822L194.218 25.4549C196.531 24.4622 197.879 22.5022 197.879 19.8296C197.879 15.8331 194.904 13.364 190.149 13.364H182.444V31.1822H186.563V26.2186H190.149H190.352L193.786 31.1822H198.209ZM193.709 19.8296C193.709 21.7641 192.437 22.9349 189.92 22.9349H186.563V16.7241H189.92C192.437 16.7241 193.709 17.8696 193.709 19.8296ZM89.0524 55.3641H95.2126C100.054 55.3641 103.318 52.2484 103.318 47.7914C103.318 43.3343 100.054 40.2186 95.2126 40.2186H89.0524V55.3641ZM90.6519 53.9793V41.6033H95.1262C99.1466 41.6033 101.74 44.1564 101.74 47.7914C101.74 51.4263 99.1466 53.9793 95.1262 53.9793H90.6519ZM107.364 41.4951C108.012 41.4951 108.488 40.9976 108.488 40.3701C108.488 39.7859 107.99 39.3099 107.364 39.3099C106.737 39.3099 106.24 39.8076 106.24 40.3916C106.24 40.9976 106.737 41.4951 107.364 41.4951ZM106.586 55.3641H108.12V43.9833H106.586V55.3641ZM121.447 43.9833V46.1686C120.496 44.6757 118.853 43.8968 116.951 43.8968C113.709 43.8968 111.245 46.1254 111.245 49.3924C111.245 52.6596 113.709 54.9313 116.951 54.9313C118.81 54.9313 120.431 54.1741 121.382 52.7244V54.1741C121.382 56.9868 120.063 58.3066 117.189 58.3066C115.438 58.3066 113.795 57.7224 112.714 56.7488L111.936 57.9171C113.125 59.0423 115.157 59.6696 117.232 59.6696C120.993 59.6696 122.917 57.8956 122.917 53.9793V43.9833H121.447ZM117.102 53.5683C114.595 53.5683 112.801 51.8589 112.801 49.3924C112.801 46.9259 114.595 45.2383 117.102 45.2383C119.61 45.2383 121.425 46.9259 121.425 49.3924C121.425 51.8589 119.61 53.5683 117.102 53.5683ZM127.986 41.4951C128.635 41.4951 129.11 40.9976 129.11 40.3701C129.11 39.7859 128.613 39.3099 127.986 39.3099C127.36 39.3099 126.863 39.8076 126.863 40.3916C126.863 40.9976 127.36 41.4951 127.986 41.4951ZM127.208 55.3641H128.743V43.9833H127.208V55.3641ZM138.46 53.5683C138.028 53.9576 137.401 54.1524 136.774 54.1524C135.499 54.1524 134.807 53.4168 134.807 52.0753V45.2816H138.265V43.9833H134.807V41.4951H133.272V43.9833H131.241V45.2816H133.272V52.1619C133.272 54.2606 134.461 55.4723 136.601 55.4723C137.487 55.4723 138.395 55.2126 139 54.6716L138.46 53.5683ZM145.772 43.8968C143.977 43.8968 142.29 44.4593 141.145 45.4329L141.837 46.5796C142.766 45.7576 144.149 45.2383 145.619 45.2383C147.738 45.2383 148.84 46.2984 148.84 48.2456V48.9381H145.23C141.967 48.9381 140.843 50.4094 140.843 52.1619C140.843 54.1308 142.421 55.4723 144.993 55.4723C146.874 55.4723 148.214 54.7583 148.906 53.5899V55.3641H150.374V48.3106C150.374 45.3681 148.71 43.8968 145.772 43.8968ZM145.23 54.2606C143.415 54.2606 142.356 53.4384 142.356 52.1186C142.356 50.9503 143.07 50.0848 145.274 50.0848H148.84V51.9456C148.235 53.4384 146.96 54.2606 145.23 54.2606ZM154.544 55.3641H156.078V39.3099H154.544V55.3641Z" fill="white"/></svg>';

  var SCENE_LOCK =
    '<div class="zdpw-sheen"></div>' +
    '<div style="width:60%;aspect-ratio:1;left:20%;top:-10%;background:radial-gradient(circle,rgba(26,79,255,.26),transparent 68%)"></div>' +
    '<div class="zdpw-card" style="left:18%;right:18%;top:18%;bottom:-8%;padding:6cqw;gap:3cqw;opacity:.7">' +
      '<div class="zdpw-bar" style="height:3.4cqw;width:66%;background:rgba(255,255,255,.10)"></div>' +
      '<div class="zdpw-bar" style="height:2.2cqw;width:86%"></div>' +
      '<div class="zdpw-bar" style="height:2.2cqw;width:54%"></div>' +
    '</div>' +
    '<div style="left:50%;top:52%;transform:translate(-50%,-50%);width:17cqw;height:17cqw;display:flex;align-items:center;justify-content:center;border-radius:3.8cqw;color:#fff;background:linear-gradient(180deg,#416CFD,#083CE9);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.45),0 0 26px rgba(26,79,255,.55)">' +
      '<svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>' +
    '</div>';

  var SCENE_COMMENT =
    '<div class="zdpw-sheen"></div>' +
    '<div class="zdpw-card" style="left:10%;width:58%;top:16%;bottom:-8%;padding:5.5cqw;gap:2.8cqw">' +
      '<div class="zdpw-bar" style="height:3.2cqw;width:70%;background:rgba(255,255,255,.10)"></div>' +
      '<div class="zdpw-bar" style="height:2cqw;width:88%"></div>' +
      '<div style="display:flex;gap:2.4cqw;margin-top:1cqw">' +
        '<div style="flex:1;height:13cqw;border-radius:8px;background:#131839;border:1px solid rgba(255,255,255,.08)"></div>' +
        '<div style="flex:1;height:13cqw;border-radius:8px;background:#131839;border:1px solid rgba(255,255,255,.08)"></div>' +
      '</div>' +
    '</div>' +
    '<div class="zdpw-pin" style="left:22%;top:50%">1</div>' +
    '<div class="zdpw-pin" style="left:50%;top:30%">2</div>' +
    '<div style="left:61%;top:40%;width:32%;padding:3.2cqw;display:flex;flex-direction:column;gap:2cqw;background:#131839;border:1px solid rgba(110,149,247,.45);border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.5)">' +
      '<div class="zdpw-bar" style="height:1.8cqw;width:90%;background:rgba(255,255,255,.18)"></div>' +
      '<div class="zdpw-bar" style="height:1.8cqw;width:62%;background:rgba(255,255,255,.12)"></div>' +
    '</div>' +
    '<svg class="zdpw-cursor" viewBox="0 0 24 24" style="left:55%;top:39%">' + CURSOR + '</svg>';

  var SCENE_DECIDE =
    '<div class="zdpw-sheen"></div>' +
    '<div style="left:14%;right:14%;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:3.4cqw">' +
      '<div class="zdpw-choice" style="background:#18181B;border:1px solid #232329;color:#C4C8D4">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>Send back' +
      '</div>' +
      '<div class="zdpw-choice" style="background:#131839;border:1px solid rgba(110,149,247,.55);box-shadow:0 0 18px rgba(26,79,255,.30);color:#fff">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#8ABFF5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Accept' +
        '<svg class="zdpw-cursor" viewBox="0 0 24 24" style="position:absolute;right:12%;bottom:-26%">' + CURSOR + '</svg>' +
      '</div>' +
    '</div>';

  var PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor"/></svg>';

  var HTML =
    '<div class="zdpw-page">' +
      '<header class="zdpw-logo">' + LOGO + '</header>' +
      '<main class="zdpw-main">' +
        '<div class="zdpw-intro"><h1 class="zdpw-heading" data-zdpw="heading"></h1><p class="zdpw-sub" data-zdpw="subheading"></p></div>' +
        '<ol class="zdpw-steps" role="list">' +
          '<li class="zdpw-step"><div class="zdpw-scene" aria-hidden="true">' + SCENE_LOCK + '</div>' +
            '<div class="zdpw-caption"><div class="zdpw-badge is-current">1</div><div class="zdpw-caption-text">' +
              '<p class="zdpw-step-title">Unlock the page</p><p class="zdpw-step-text">Enter the password below.</p></div></div></li>' +
          '<li class="zdpw-step"><div class="zdpw-scene" aria-hidden="true">' + SCENE_COMMENT + '</div>' +
            '<div class="zdpw-caption"><div class="zdpw-badge">2</div><div class="zdpw-caption-text">' +
              '<p class="zdpw-step-title">Comment in Superflow</p><div data-zdpw="tutorial"></div></div></div></li>' +
          '<li class="zdpw-step"><div class="zdpw-scene" aria-hidden="true">' + SCENE_DECIDE + '</div>' +
            '<div class="zdpw-caption"><div class="zdpw-badge">3</div><div class="zdpw-caption-text">' +
              '<p class="zdpw-step-title">Send it back or accept it</p><p class="zdpw-step-text" data-zdpw="clickup"></p></div></div></li>' +
        '</ol>' +
        '<div class="zdpw-form-area"><label class="zdpw-label">Page password</label></div>' +
        '<p class="zdpw-help" data-zdpw="slack">Need the password? </p>' +
      '</main>' +
    '</div>';

  /* ---------- Behavior ---------- */

  function link(href, text, cls) {
    var a = document.createElement('a');
    a.className = 'zdpw-link' + (cls ? ' ' + cls : '');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
  }

  function build() {
    var root = document.createElement('div');
    root.id = 'zdpw';
    root.setAttribute('data-version', VERSION);
    root.innerHTML = HTML;
    var slot = function (name) { return root.querySelector('[data-zdpw="' + name + '"]'); };

    slot('heading').textContent = cfg.heading;
    slot('subheading').textContent = cfg.subheading;

    var tut = slot('tutorial');
    if (cfg.tutorial) {
      var a = link(cfg.tutorial, 'Watch the tutorial (6 min)', 'is-video');
      a.insertAdjacentHTML('afterbegin', PLAY);
      tut.parentNode.replaceChild(a, tut);
    } else {
      tut.parentNode.removeChild(tut);
    }

    var cu = slot('clickup');
    if (cfg.clickup) {
      cu.appendChild(document.createTextNode('In the page’s '));
      cu.appendChild(link(cfg.clickup, 'ClickUp task'));
      cu.appendChild(document.createTextNode('.'));
    } else {
      cu.textContent = 'In the ClickUp task we sent you.';
    }

    var help = slot('slack');
    if (cfg.slack) help.appendChild(link(cfg.slack, 'Message us in Slack'));
    else help.parentNode.removeChild(help);

    return root;
  }

  function adoptForm(root, wrap, form, input, submit) {
    var fail = form.querySelector('.w-form-fail');

    // Same wording on every site, whatever the Designer settings say
    submit.value = 'Unlock Page';
    submit.setAttribute('data-wait', 'Unlocking…');
    if (fail) (fail.firstElementChild || fail).textContent = cfg.error;
    input.removeAttribute('placeholder');
    input.setAttribute('autocomplete', 'current-password');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('autocapitalize', 'off');
    if (!input.id) input.id = 'pass';
    // The form's own (hidden) label would otherwise be read out as well
    [].forEach.call(form.querySelectorAll('label'), function (l) { if (l.htmlFor === input.id) l.removeAttribute('for'); });
    root.querySelector('.zdpw-label').htmlFor = input.id;
    form.setAttribute('aria-label', 'Unlock page');

    // One shell around field and button, as in the design
    var shell = document.createElement('div');
    shell.className = 'zdpw-shell';
    var field = document.createElement('div');
    field.className = 'zdpw-field';
    form.insertBefore(shell, input);
    shell.appendChild(field);
    field.appendChild(input);
    shell.appendChild(submit);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'zdpw-toggle';
    toggle.textContent = 'Show';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.setAttribute('aria-controls', input.id);
    toggle.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
    field.appendChild(toggle);
    // Never submit the password while it's shown as text (some password managers skip text fields)
    form.addEventListener('submit', function () { input.type = 'password'; });

    // The whole Webflow wrapper moves (webflow.js looks the form's .w-form parent up), so login is untouched
    root.querySelector('.zdpw-form-area').appendChild(wrap);

    // Webflow reloads with ?e=1 after a wrong password
    if (/[?&]e=1(&|$)/.test(location.search)) {
      form.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      if (fail) {
        fail.style.display = 'block';
        if (!fail.id) fail.id = 'zdpw-error';
        fail.setAttribute('role', 'alert');
        input.setAttribute('aria-describedby', fail.id);
      }
    }
  }

  function init(force) {
    var wrap = document.querySelector('.w-password-page.w-form');
    var form = wrap && wrap.querySelector('form.w-password-page');
    var input = form && form.querySelector('input[name="pass"]');
    var submit = form && form.querySelector('input[type="submit"]');
    // The hidden "page" field comes last; wait for it so the whole form is parsed before it moves
    var parsed = form && form.querySelector('input[name="page"]');
    if (!input || !submit || (!parsed && !force)) return false;
    if (document.getElementById('zdpw')) return true;

    var root = build();
    adoptForm(root, wrap, form, input, submit);
    document.body.appendChild(root);
    document.documentElement.classList.add('zdpw-on');
    reveal();
    if (!/Mobi|Android/i.test(navigator.userAgent) || /[?&]e=1(&|$)/.test(location.search)) input.focus();
    return true;
  }

  function reveal() {
    document.documentElement.classList.remove('zdpw-wait');
  }

  var style = document.createElement('style');
  style.id = 'zdpw-style';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  // Loaded early (in the page, before the form): hold the paint until the overlay is in, at most 3s
  if (document.readyState === 'loading') {
    document.documentElement.classList.add('zdpw-wait');
    setTimeout(reveal, 3000);
  }

  if (!init()) {
    var mo = new MutationObserver(function () { if (document.body && init()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    var finish = function () { mo.disconnect(); init(true); reveal(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', finish);
    else finish();
  }
})();
