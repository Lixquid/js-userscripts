// ==UserScript==
// @name         Clyp Autoplayer
// @namespace    https://lixquid.com/
// @version      0.1
// @author       Lixquid
// @description  Automatically plays Clyp audio files as they load, and ensures only one Clyp window is kept open at a time.
// @supportURL   https://github.com/Lixquid/js-monkey-userscripts/issues
// @icon         https://www.google.com/s2/favicons?domain=clyp.it
// @match        https://clyp.it/*
// @grant        localStorage
// ==/UserScript==

(function () {
    "use strict";

    const id = String(Math.random());
    localStorage.setItem("AUTOPLAY_ID", id);

    setInterval(() => {
        if (localStorage.getItem("AUTOPLAY_ID") !== id) {
            close();
        }
        const e = document.querySelector("div.play-button:nth-child(2)");
        if (e.style.display !== "none") {
            e.click();
        }
    }, 1000);
})();
