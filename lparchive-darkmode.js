// ==UserScript==
// @name         LP Archive Dark Mode
// @namespace    https://lixquid.com/
// @version      0.1
// @author       Lixquid
// @description  Forces a dark mode for the LP Archive.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/Lixquid/js-userscripts/master/lparchive-darkmode.js
// @downloadURL  https://raw.githubusercontent.com/Lixquid/js-userscripts/master/lparchive-darkmode.js
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://lparchive.org&size=16
// @match        https://lparchive.org/*
// ==/UserScript==

(function () {
    "use strict";

    document.getElementsByTagName("html")[0].style.background = "#222";
    document.body.style.background = "#222";
    document.body.style.color = "#eee";
    var content = document.getElementById("content");
    if (content) {
        content.style.background = "#333";
        content.style.color = "#eee";
    }
})();
