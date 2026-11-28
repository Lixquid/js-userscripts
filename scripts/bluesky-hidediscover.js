// ==UserScript==
// @name         Bluesky Hide Discover and Following Rows After
// @namespace    https://lixquid.com/
// @version      1.0
// @author       Lixquid
// @description  Hide Discover and everything after it in the Following feed.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/Lixquid/js-userscripts/master/scripts/bluesky-hidediscover.js
// @downloadURL  https://raw.githubusercontent.com/Lixquid/js-userscripts/master/scripts/bluesky-hidediscover.js
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bsky.app&size=16
// @match        https://bsky.app/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const FEED = '[data-testid="followingFeedPage-feed-flatlist"]';
    const ROW = "[data-list-row]";
    const DISCOVER = 'a[href="/profile/bsky.app/feed/whats-hot"]';

    function hideAfterDiscover() {
        document.querySelectorAll(FEED).forEach((feed) => {
            const rows = [...feed.querySelectorAll(ROW)];

            const index = rows.findIndex((row) => {
                const link = row.querySelector(DISCOVER);
                return link && link.textContent.trim() === "Discover";
            });

            if (index === -1) return;

            rows.slice(index).forEach((row) => {
                row.style.setProperty("display", "none", "important");
            });
        });
    }

    const observer = new MutationObserver(hideAfterDiscover);

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    hideAfterDiscover();
})();
