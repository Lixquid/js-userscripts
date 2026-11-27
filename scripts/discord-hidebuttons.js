// ==UserScript==
// @name         Hide Discord Buttons
// @namespace    https://lixquid.com/
// @version      0.2
// @author       Lixquid
// @description  Hides unwanted buttons in Discord's UI, such as the GIF picker, the Send Gift button, the Server Boost button, and others. Configurable via a Settings menu entry.
// @license      MIT
// @supportURL   https://github.com/Lixquid/js-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/Lixquid/js-userscripts/master/scripts/discord-hidebuttons.js
// @downloadURL  https://raw.githubusercontent.com/Lixquid/js-userscripts/master/scripts/discord-hidebuttons.js
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://discord.com&size=16
// @match        https://discord.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    "use strict";

    //// OPTIONS ////

    // Default settings. Used as the fallback if nothing has been saved yet.
    const defaultOptions = [
        { id: "sendGift", label: "Send a gift", hide: true },
        { id: "gifPicker", label: "GIF picker", hide: true },
        { id: "stickerPicker", label: "Sticker picker", hide: true },
        { id: "emojiPicker", label: "Emoji picker", hide: false },
        { id: "appLauncher", label: "App Launcher", hide: true },
    ];

    // Returns the CSS rule for a given option, or null if it has no rule.
    function cssForOption(option) {
        switch (option.id) {
            case "sendGift":
                return [
                    "*[class^='buttons'] *[aria-label*='send a gift'i] { display: none; }",
                    "*[class^='buttons'] *[aria-label*='give a gift'i] { display: none; }",
                ];
            case "gifPicker":
                return ["*[class^='buttons'] *[aria-label*='open gif picker'i] { display: none; }"];
            case "stickerPicker":
                return ["*[class^='buttons'] *[aria-label*='open sticker picker'i] { display: none; }"];
            case "emojiPicker":
                return ["*[class^='buttons'] *[aria-label*='select emoji'i] { display: none; }"];
            case "appLauncher":
                return ["*[class^='buttons'] *[class*='app-launcher-entrypoint'i] { display: none; }"];
            default:
                return null;
        }
    }

    //// SETTINGS STORAGE ////

    const storageKey = "settings";

    function loadSettings() {
        const saved = GM_getValue(storageKey, null);
        if (!saved) {
            return defaultOptions.map((option) => ({ ...option }));
        }
        const savedMap = new Map(Object.entries(saved));
        return defaultOptions.map((option) => ({
            ...option,
            hide: savedMap.has(option.id) ? Boolean(savedMap.get(option.id)) : option.hide,
        }));
    }

    function saveSettings(options) {
        GM_setValue(storageKey, Object.fromEntries(options.map((option) => [option.id, option.hide])));
    }

    //// CSS APPLICATION ////

    let styleElement = null;

    function applyStyles(options) {
        let css = "";
        for (const option of options) {
            if (!option.hide) {
                continue;
            }
            for (const rule of cssForOption(option) || []) {
                css += rule + "\n";
            }
        }

        if (styleElement === null) {
            styleElement = document.createElement("style");
            document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = css;
    }

    //// SETTINGS DIALOG ////

    function openSettingsDialog() {
        const options = loadSettings();

        const dialog = document.createElement("dialog");
        dialog.innerHTML = `
            <style>
                dialog {
                    border: 1px solid #4e5058;
                    border-radius: 8px;
                    background-color: #313338;
                    color: #dbdee1;
                    font-family: system-ui, sans-serif;
                    padding: 20px;
                    min-width: 320px;
                }
                dialog::backdrop {
                    background-color: rgba(0, 0, 0, 0.7);
                }
                dialog h2 {
                    margin: 0 0 16px 0;
                    font-size: 20px;
                    color: #f2f3f5;
                }
                dialog .option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 0;
                    font-size: 15px;
                }
                dialog .option input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: #5865f2;
                    cursor: pointer;
                }
                dialog .option label {
                    cursor: pointer;
                    user-select: none;
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
            </style>
            <h2>Hide Discord Buttons — Settings</h2>
            ${options
                .map(
                    (option) => `
                <div class="option">
                    <input type="checkbox" id="hide-${option.id}" ${option.hide ? "checked" : ""} />
                    <label for="hide-${option.id}">Hide: ${option.label}</label>
                </div>
            `,
            )
            .join("")}
            <div class="buttons">
                <button class="cancel" type="button">Cancel</button>
                <button class="save" type="button">Save</button>
            </div>
        `;
        document.body.appendChild(dialog);

        dialog.querySelector("button.cancel").addEventListener("click", () => dialog.close());
        dialog.querySelector("button.save").addEventListener("click", () => {
            for (const option of options) {
                option.hide = dialog.querySelector(`#hide-${option.id}`).checked;
            }
            saveSettings(options);
            applyStyles(options);
            dialog.close();
        });
        dialog.addEventListener("close", () => dialog.remove());

        dialog.showModal();
    }

    //// MAIN ////

    GM_registerMenuCommand("Settings", openSettingsDialog);

    applyStyles(loadSettings());
})();
