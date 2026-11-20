---
key: privacy
lang: en
updated: '2026-11-20'
---

**In short: Stock-o-mètre collects no data.** Your file is read and analysed in your browser. It is never sent to any server.

## Your file stays on your computer

- The file you load is read locally by your browser, using a _Web Worker_, a program that runs on your own machine.
- Nothing is uploaded: the site has no application server, no database and no API. It consists only of static files (pages, scripts, styles).
- A Content Security Policy (CSP) forbids the browser from connecting to any site other than this one. An automated test checks at every update that no network request is made while a file is analysed.
- Exports (results CSV, chart images) are generated in your browser and saved directly to your computer.
- When you close or reload the page, the data held in memory is gone.

You can check this yourself: open your browser’s developer tools (Network tab), load a file and run the calculation. You can also go offline once the page has loaded; the tool keeps working.

## No cookies, no trackers

- No cookies are set.
- No analytics, no advertising pixels, no third-party scripts.
- No fonts, libraries or images are loaded from another site: everything is served from this site.

## What your browser remembers

To spare you from mapping columns again for every file, the tool stores the following in your browser’s local storage (_localStorage_):

- which column holds which piece of information, for a given file layout (identified by its headers);
- the chosen date format and decimal separator;
- how movement types are classified (for example “Sale” → issue).

Your file’s rows, items, quantities and prices are **never** stored. These settings stay on your computer and are never transmitted. To erase them, clear this site’s data in your browser settings.

## Hosting

The site is hosted on GitHub Pages (GitHub Inc.). Like any web host, GitHub may record connection information such as IP addresses in its technical logs, for security and to operate the service. Those logs do not contain your files, which never leave your computer. See GitHub’s privacy statement for details.

## Share buttons

The “LinkedIn” and “Email” buttons are plain links: nothing is loaded from LinkedIn unless you click. The shared link points to the tool’s home page and never contains your data.

## Contact

For questions about this page, see the [legal notice](/en/legal-notice/).
