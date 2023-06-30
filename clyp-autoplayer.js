// ==UserScript==
// @name         Clyp Autoplayer
// @namespace    https://lixquid.com/
// @version      0.2
// @author       Lixquid
// @description  Automatically plays Clyp audio files as they load, and ensures only one Clyp window is kept open at a time.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-monkey-userscripts/issues
// @icon         https://www.google.com/s2/favicons?domain=clyp.it
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
