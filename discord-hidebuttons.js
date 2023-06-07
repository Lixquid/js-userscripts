// ==UserScript==
// @name         Hide Discord Buttons
// @namespace    https://lixquid.com/
// @version      0.1
// @author       Lixquid
// @description  Hides unwanted buttons in Discord's UI, such as the GIF picker, the Send Gift button, the Server Boost button, and others.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-monkey-userscripts/issues
// @icon         https://www.google.com/s2/favicons?domain=discord.com
// @match        https://discord.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    //// OPTIONS ////

    // Set to true to hide the button, false to show it.
    const toHide = {
        "Send a gift": true,
        "GIF picker": true,
        "Sticker picker": true,
        "Emoji picker": false,

        // Note: You can still use Super Reactions by clicking on someone else's Super Reaction.
        "Super Reactions": true,
    };

    //// DO NOT EDIT BELOW THIS LINE ////
    let css = "";

    if (toHide["Send a gift"]) {
        css += "button[aria-label='Send a gift'] { display: none; }";
    }
    if (toHide["GIF picker"]) {
        css += "button[aria-label='Open GIF picker'] { display: none; }";
    }
    if (toHide["Sticker picker"]) {
        css += "button[aria-label='Open sticker picker'] { display: none; }";
    }
    if (toHide["Emoji picker"]) {
        css += "button[aria-label='Select emoji'] { display: none; }";
    }

    if (toHide["Super Reactions"]) {
        css += "[aria-label='Add Super Reaction'] { display: none; }";
        css += "#message-actions-add-reaction-1 { display: none; }";
    }

    if (css.length > 0) {
        let style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
    }
})();
