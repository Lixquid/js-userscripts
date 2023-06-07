// ==UserScript==
// @name         LP Archive Dark Mode
// @namespace    https://lixquid.com/
// @version      0.1
// @author       Lixquid
// @description  Forces a dark mode for the LP Archive.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-monkey-userscripts/issues
// @icon         https://lparchive.org/favicon.ico
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
