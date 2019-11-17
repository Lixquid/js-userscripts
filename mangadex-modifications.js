// ==UserScript==
// @name         MangaDex Modifications
// @version      0.1
// @description  Adds various features to MangaDex.
// @icon         https://mangadex.org/favicon-192x192.png?1
// @author       Lixquid
// @namespace    https://lixquid.com/
// @match        https://mangadex.org/*
// ==/UserScript==

(function() {
    'use strict';

    var e = document.querySelector("span.fa-eye[title=Read]");
    if (e) {
        e.title = "Mark all as read";
        e.style.cursor = "pointer";
        e.addEventListener("click", function() {
            var n = document.querySelectorAll("span[title='Mark read']");
            for (var i = 0; i < n.length; i++) {
                n[i].click()
            }
        });
    }

})();
