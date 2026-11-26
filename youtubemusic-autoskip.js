// ==UserScript==
// @name         YouTube Music Auto Skip
// @namespace    https://lixquid.com/
// @version      0.2
// @author       Lixquid
// @description  Automatically skips songs on YouTube Music depending on user-defined rules. Configurable via a Settings menu entry.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/Lixquid/js-userscripts/master/youtubemusic-autoskip.js
// @downloadURL  https://raw.githubusercontent.com/Lixquid/js-userscripts/master/youtubemusic-autoskip.js
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://music.youtube.com&size=16
// @match        https://music.youtube.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";

    //// OPTIONS ////

    // Default rules. Used as the fallback if nothing has been saved yet.
    // Rules contain a title and/or artist to match against.
    // If both are present, both must match.
    const defaultRules = [
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

    //// SETTINGS STORAGE ////

    const storageKey = "rules";

    function loadRules() {
        const saved = GM_getValue(storageKey, null);
        if (!Array.isArray(saved)) {
            return defaultRules.map((rule) => ({ ...rule }));
        }
        return saved.map((rule) => ({
            title: typeof rule.title === "string" ? rule.title : "",
            artist: typeof rule.artist === "string" ? rule.artist : "",
        }));
    }

    function saveRules(rules) {
        GM_setValue(storageKey, rules);
    }

    //// RULE MATCHING ////

    let rules = loadRules();

    function shouldSkip(songTitle, songArtist) {
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
            return true;
        }
        return false;
    }

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

        if (shouldSkip(songTitle, songArtist)) {
            document.querySelector(".ytmusic-player-bar .next-button").click();
        }
    }, 5000);

    //// SETTINGS DIALOG ////

    // NOTE: This page enforces "require-trusted-types-for 'script'", so
    // innerHTML and other injection sinks cannot be used. The dialog is
    // built entirely with DOM APIs instead.
    function openSettingsDialog() {
        const dialogRules = rules.map((rule) => ({ ...rule }));

        const dialog = document.createElement("dialog");

        const style = document.createElement("style");
        style.textContent = `
                dialog {
                    border: 1px solid #4e5058;
                    border-radius: 8px;
                    background-color: #313338;
                    color: #dbdee1;
                    font-family: system-ui, sans-serif;
                    padding: 20px;
                    min-width: 380px;
                }
                dialog::backdrop {
                    background-color: rgba(0, 0, 0, 0.7);
                }
                dialog h2 {
                    margin: 0 0 16px 0;
                    font-size: 20px;
                    color: #f2f3f5;
                }
                dialog .rule {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 0;
                }
                dialog .rule input[type="text"] {
                    flex: 1;
                    min-width: 0;
                    padding: 8px 10px;
                    border: 1px solid #4e5058;
                    border-radius: 4px;
                    background-color: #383a40;
                    color: #dbdee1;
                    font-size: 14px;
                    font-family: system-ui, sans-serif;
                }
                dialog .rule input[type="text"]::placeholder {
                    color: #797b81;
                }
                dialog .rule input[type="text"]:focus {
                    outline: none;
                    border-color: #5865f2;
                }
                dialog .rule .remove {
                    flex: none;
                    width: 28px;
                    height: 28px;
                    padding: 0;
                    border: none;
                    border-radius: 4px;
                    background-color: transparent;
                    color: #dbdee1;
                    font-size: 16px;
                    line-height: 28px;
                    cursor: pointer;
                }
                dialog .rule .remove:hover {
                    background-color: #da373c;
                    color: #ffffff;
                }
                dialog .add-rule {
                    margin-top: 8px;
                    padding: 6px 12px;
                    border: 1px dashed #4e5058;
                    border-radius: 4px;
                    background-color: transparent;
                    color: #dbdee1;
                    font-size: 14px;
                    cursor: pointer;
                }
                dialog .add-rule:hover {
                    border-color: #5865f2;
                    color: #ffffff;
                }
                dialog .buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 16px;
                }
                dialog button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                }
                dialog .cancel {
                    background-color: transparent;
                    color: #dbdee1;
                }
                dialog .cancel:hover {
                    text-decoration: underline;
                }
                dialog .save {
                    background-color: #5865f2;
                    color: #ffffff;
                }
                dialog .save:hover {
                    background-color: #4752c4;
                }
        `;
        dialog.appendChild(style);

        const heading = document.createElement("h2");
        heading.textContent = "YouTube Music Auto Skip — Settings";
        dialog.appendChild(heading);

        const rulesContainer = document.createElement("div");
        rulesContainer.className = "rules";
        dialog.appendChild(rulesContainer);

        function addRuleRow(rule) {
            const row = document.createElement("div");
            row.className = "rule";

            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.className = "title";
            titleInput.placeholder = "Title contains...";
            titleInput.value = rule.title || "";

            const artistInput = document.createElement("input");
            artistInput.type = "text";
            artistInput.className = "artist";
            artistInput.placeholder = "Artist contains...";
            artistInput.value = rule.artist || "";

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove";
            removeButton.title = "Remove rule";
            removeButton.textContent = "\u00d7";
            removeButton.addEventListener("click", () => row.remove());

            row.append(titleInput, artistInput, removeButton);
            rulesContainer.appendChild(row);
        }

        dialogRules.forEach(addRuleRow);

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-rule";
        addButton.textContent = "+ Add rule";
        addButton.addEventListener("click", () => addRuleRow({}));
        dialog.appendChild(addButton);

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel";
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", () => dialog.close());

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "save";
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", () => {
            const newRules = [];
            for (const row of rulesContainer.querySelectorAll(".rule")) {
                const title = row.querySelector(".title").value.trim();
                const artist = row.querySelector(".artist").value.trim();
                if (!title && !artist) {
                    continue;
                }
                newRules.push({ title, artist });
            }
            rules = newRules;
            saveRules(rules);
            dialog.close();
        });

        buttonsContainer.append(cancelButton, saveButton);
        dialog.appendChild(buttonsContainer);

        document.body.appendChild(dialog);
        dialog.addEventListener("close", () => dialog.remove());

        dialog.showModal();
    }

    //// MAIN ////

    GM_registerMenuCommand("Settings", openSettingsDialog);
})();
