// ==UserScript==
// @name         Clyp Autoplayer
// @namespace    https://lixquid.com/
// @version      0.2
// @author       Lixquid
// @description  Automatically plays Clyp audio files as they load, and ensures only one Clyp window is kept open at a time.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/Lixquid/js-userscripts/master/clyp-autoplayer.js
// @downloadURL  https://raw.githubusercontent.com/Lixquid/js-userscripts/master/clyp-autoplayer.js
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://clyp.it&size=16
// @match        https://clyp.it/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    "use strict";

    const id = String(Math.random());
    GM_setValue("AUTOPLAY_ID", id);

    setInterval(() => {
        if (GM_getValue("AUTOPLAY_ID") !== id) {
            close();
            return;
        }
        const e = document.querySelector("div.play-button:nth-child(2)");
        if (e.style.display !== "none") {
            e.click();
        }
    }, 1000);
})();
