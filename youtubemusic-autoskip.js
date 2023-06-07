// ==UserScript==
// @name         YouTube Music Auto Skip
// @namespace    https://lixquid.com/
// @version      0.1
// @author       Lixquid
// @description  Automatically skips songs on YouTube Music depending on user-defined rules.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-monkey-userscripts/issues
// @icon         https://www.google.com/s2/favicons?domain=music.youtube.com
// @match        https://music.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    //// OPTIONS ////

    // Rules contain a title and/or artist to match against.
    // If both are present, both must match.
    const rules = [
        {
            title: "title name",
        },
        {
            artist: "artist name",
        },
        {
            title: "title",
            artist: "and artist",
        },
    ];

    //// DO NOT EDIT BELOW THIS LINE ////

    setInterval(() => {
        /** @type string */
        const songTitle =
            document
                .querySelector(".ytmusic-player-bar .title")
                ?.innerText.toLowerCase() ?? "";
        /** @type string */
        const songArtist =
            document
                .querySelector(".ytmusic-player-bar .byline")
                ?.innerText.toLowerCase() ?? "";

        if (songTitle === "" && songArtist === "") {
            return;
        }

        for (const { title, artist } of rules) {
            if (!title && !artist) {
                continue;
            }
            if (title && !songTitle.includes(title.toLowerCase())) {
                continue;
            }
            if (artist && !songArtist.includes(artist.toLowerCase())) {
                continue;
            }
            document.querySelector(".ytmusic-player-bar .next-button").click();
            break;
        }
    }, 5000);
})();
