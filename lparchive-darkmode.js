// ==UserScript==
// @name         LP Archive Dark Mode
// @namespace    https://lixquid.com/
// @version      0.1
// @description  Easy on the eyes.
// @icon         https://lparchive.org/favicon.ico
// @author       Lixquid
// @match        https://lparchive.org/*
// ==/UserScript==

(function() {
    'use strict';

    document.getElementsByTagName("html")[0].style.background = "#222"
    document.body.style.background = "#222"
    document.body.style.color = "#eee"
    var content = document.getElementById("content")
    if (content) {
        content.style.background = "#333"
        content.style.color = "#eee"
    }
    
})();
