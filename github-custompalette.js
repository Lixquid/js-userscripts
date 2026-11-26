// ==UserScript==
// @name         GitHub Custom Palette
// @namespace    https://lixquid.com/
// @version      0.2.1
// @author       Lixquid
// @description  Quick-switch between your own GitHub repositories.
// @match        https://github.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

(() => {
    "use strict";

    const CACHE_KEY = "owned-repos-cache";
    const CACHE_TTL = 24 * 60 * 60 * 1000;
    const FAIL_TTL = 10 * 60 * 1000;
    const CREATED_KEY = "repo-palette-visited-new";

    let repositories = [];
    let selectedIndex = 0;
    let palette;
    let input;
    let results;
    let errorBox;
    let spinner;
    let refreshPromise;

    // --------------------------------------------------
    // Repository discovery and caching
    // --------------------------------------------------

    function isRepositoryPath(path) {
        const parts = path.split("/").filter(Boolean);

        return (
            parts.length === 2 &&
            !["settings", "notifications", "new"].includes(parts[0])
        );
    }

    async function fetchRepositories() {
        const login = document.querySelector(
            'meta[name="user-login"]',
        )?.content;

        if (!login) {
            throw new Error(
                "Could not determine your GitHub username. " +
                    "Make sure you are logged in.",
            );
        }

        const found = new Map();
        // Some userscript managers run fetch() in a sandbox where
        // relative URLs are not resolved against the page origin, so
        // always use fully-qualified URLs.
        let url = new URL(
            `/${encodeURIComponent(login)}?tab=repositories&type=owner`,
            location.origin,
        ).href;
        const visited = new Set();

        while (url && !visited.has(url)) {
            visited.add(url);

            const response = await fetch(url, {
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error(
                    `GitHub returned HTTP ${response.status} for ${url}`,
                );
            }

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, "text/html");

            const links = doc.querySelectorAll(
                'a[itemprop="name codeRepository"], ' +
                    'a[data-hovercard-type="repository"]',
            );

            for (const link of links) {
                const href = link.getAttribute("href");
                if (!href) continue;

                const parts = href.split("/").filter(Boolean);

                if (
                    parts.length !== 2 ||
                    parts[0].toLowerCase() !== login.toLowerCase()
                ) {
                    continue;
                }

                const fullName = `${parts[0]}/${parts[1]}`;

                found.set(fullName.toLowerCase(), {
                    name: parts[1],
                    owner: parts[0],
                    fullName,
                    url: `https://github.com/${fullName}`,
                    description: "",
                });
            }

            const next = doc.querySelector(
                '.paginate-container a[rel="next"], ' + 'a[rel="next"]',
            );

            const nextHref = next?.getAttribute("href");
            url = nextHref ? new URL(nextHref, location.origin).href : null;
        }

        return [...found.values()].sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
        );
    }

    async function refreshRepositories(force = false) {
        showSpinner();

        try {
            if (refreshPromise) {
                return refreshPromise;
            }

            refreshPromise = (async () => {
                const cached = await GM_getValue(CACHE_KEY, null);
                const now = Date.now();

                if (!force && cached?.repositories) {
                    if (now - cached.timestamp < CACHE_TTL) {
                        repositories = cached.repositories;
                        return repositories;
                    }

                    // Cache is stale. If a refresh attempt failed recently,
                    // keep serving the stale cache instead of retrying the
                    // scrape on every palette open.
                    if (now - (cached.lastAttempt ?? 0) < FAIL_TTL) {
                        repositories = cached.repositories;
                        return repositories;
                    }
                }

                try {
                    const fresh = await fetchRepositories();

                    await GM_setValue(CACHE_KEY, {
                        timestamp: now,
                        repositories: fresh,
                    });

                    repositories = fresh;
                    return repositories;
                } catch (error) {
                    console.error(
                        "[Repo Palette] Repository refresh failed:",
                        error,
                    );

                    // Record the failed attempt so we back off instead of
                    // retrying on every palette open.
                    if (cached) {
                        cached.lastAttempt = now;
                        await GM_setValue(CACHE_KEY, cached);
                    }

                    if (cached?.repositories) {
                        repositories = cached.repositories;
                        return repositories;
                    }

                    throw error;
                }
            })();

            return await refreshPromise;
        } finally {
            refreshPromise = null;
            hideSpinner();
        }
    }

    // --------------------------------------------------
    // Repository creation detection
    // --------------------------------------------------

    if (location.pathname === "/new") {
        sessionStorage.setItem(CREATED_KEY, "1");
    } else if (sessionStorage.getItem(CREATED_KEY)) {
        sessionStorage.removeItem(CREATED_KEY);

        if (isRepositoryPath(location.pathname)) {
            // A repository was just created.
            GM_deleteValue(CACHE_KEY);
        }
    }

    // --------------------------------------------------
    // Palette UI
    // --------------------------------------------------

    function createPalette() {
        const style = document.createElement("style");

        style.textContent = `
            #repo-palette-overlay {
                position: fixed;
                inset: 0;
                z-index: 999999;
                background: rgba(0, 0, 0, .55);
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 15vh 16px 16px;
            }

            #repo-palette {
                width: 600px;
                max-width: 100%;
                max-height: 70vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: var(--bgColor-default, #fff);
                color: var(--fgColor-default, #1f2328);
                border: 1px solid var(--borderColor-default, #d1d9e0);
                border-radius: 12px;
                box-shadow: 0 16px 48px rgba(0,0,0,.3);
                font-family: -apple-system, BlinkMacSystemFont,
                    "Segoe UI", sans-serif;
            }

            #repo-palette input {
                width: 100%;
                box-sizing: border-box;
                padding: 18px 20px;
                border: none;
                border-bottom: 1px solid
                    var(--borderColor-default, #d1d9e0);
                outline: none;
                font-size: 18px;
                color: inherit;
                background: transparent;
            }

            #repo-palette-results {
                overflow-y: auto;
                padding: 6px;
            }

            #repo-palette-spinner {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                font-size: 12px;
                opacity: .65;
                border-top: 1px solid
                    var(--borderColor-default, #d1d9e0);
            }

            #repo-palette-spinner[hidden] {
                display: none;
            }

            .repo-palette-spinner-icon {
                width: 14px;
                height: 14px;
                box-sizing: border-box;
                border: 2px solid
                    var(--borderColor-default, #d1d9e0);
                border-top-color: var(--fgColor-accent, #0969da);
                border-radius: 50%;
                animation: repo-palette-spin .8s linear infinite;
            }

            @keyframes repo-palette-spin {
                to { transform: rotate(360deg); }
            }

            #repo-palette-error {
                padding: 8px 14px;
                font-size: 12px;
                color: var(--fgColor-danger, #d1242f);
                border-top: 1px solid var(--borderColor-default, #d1d9e0);
            }

            .repo-palette-item {
                padding: 11px 14px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                font-size: 14px;
            }

            .repo-palette-item.selected {
                background: var(--bgColor-accent-emphasis, #0969da);
                color: white;
            }

            .repo-palette-owner {
                opacity: .65;
                margin-right: 5px;
            }

            .repo-palette-empty {
                padding: 24px;
                text-align: center;
                opacity: .65;
            }

            .repo-palette-footer {
                padding: 9px 14px;
                border-top: 1px solid
                    var(--borderColor-default, #d1d9e0);
                font-size: 12px;
                opacity: .65;
            }
        `;

        document.head.appendChild(style);

        palette = document.createElement("div");
        palette.id = "repo-palette-overlay";
        palette.style.display = "none";

        palette.innerHTML = `
            <div id="repo-palette">
                <input
                    id="repo-palette-input"
                    type="text"
                    placeholder="Search your repositories..."
                    autocomplete="off"
                    spellcheck="false"
                />
                <div id="repo-palette-results"></div>
                <div id="repo-palette-spinner" hidden>
                    <span class="repo-palette-spinner-icon"></span>
                    Loading repositories…
                </div>
                <div id="repo-palette-error" hidden></div>
                <div class="repo-palette-footer">
                    ↑ ↓ Navigate &nbsp; ↵ Open &nbsp; Esc Close
                    <span style="float:right">GitHub Repositories</span>
                </div>
            </div>
        `;

        document.body.appendChild(palette);

        input = palette.querySelector("input");
        results = palette.querySelector("#repo-palette-results");
        errorBox = palette.querySelector("#repo-palette-error");
        spinner = palette.querySelector("#repo-palette-spinner");

        input.addEventListener("input", renderResults);

        input.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                selectItem(selectedIndex + 1);
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                selectItem(selectedIndex - 1);
            }

            if (event.key === "Enter") {
                event.preventDefault();
                openSelected();
            }

            if (event.key === "Escape") {
                closePalette();
            }
        });

        palette.addEventListener("mousedown", (event) => {
            if (event.target === palette) {
                closePalette();
            }
        });
    }

    function getFiltered() {
        const query = input.value.toLowerCase().trim();

        if (!query) return repositories;

        return repositories.filter((repo) =>
            repo.fullName.toLowerCase().includes(query),
        );
    }

    function selectItem(index) {
        const items = results.querySelectorAll(".repo-palette-item");

        if (!items.length) {
            return;
        }

        selectedIndex = Math.max(0, Math.min(index, items.length - 1));

        items.forEach((item, i) => {
            item.classList.toggle("selected", i === selectedIndex);
        });

        items[selectedIndex]?.scrollIntoView({
            block: "nearest",
        });
    }

    function renderResults() {
        const filtered = getFiltered();

        selectedIndex = Math.min(
            selectedIndex,
            Math.max(0, filtered.length - 1),
        );

        results.replaceChildren();

        if (!filtered.length) {
            const empty = document.createElement("div");
            empty.className = "repo-palette-empty";
            empty.textContent = repositories.length
                ? "No matching repositories"
                : "No repositories found";
            results.appendChild(empty);
            return;
        }

        filtered.forEach((repo, index) => {
            const item = document.createElement("div");
            item.className = "repo-palette-item";

            if (index === selectedIndex) {
                item.classList.add("selected");
            }

            const name = document.createElement("span");
            name.textContent = repo.fullName;

            item.appendChild(name);

            // Update the selection in place instead of re-rendering:
            // re-rendering recreates the hovered element, which fires
            // mouseenter again and loops forever.
            item.addEventListener("mouseenter", () => {
                selectItem(index);
            });

            item.addEventListener("click", () => {
                location.href = repo.url;
            });

            results.appendChild(item);
        });

        results.children[selectedIndex]?.scrollIntoView({
            block: "nearest",
        });
    }

    function openSelected() {
        const repo = getFiltered()[selectedIndex];

        if (repo) {
            location.href = repo.url;
        }
    }

    function showSpinner() {
        spinner.hidden = false;
    }

    function hideSpinner() {
        spinner.hidden = true;
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function hideError() {
        errorBox.hidden = true;
    }

    async function openPalette() {
        palette.style.display = "flex";
        input.value = "";
        selectedIndex = 0;
        hideError();

        // Show cached results immediately.
        renderResults();
        input.focus();

        try {
            await refreshRepositories();
            renderResults();
            hideError();
        } catch (error) {
            // Keep any cached results that are already rendered; surface
            // the failure as a banner instead of clearing the list.
            showError(
                repositories.length
                    ? "Could not refresh repositories. Showing cached results."
                    : "Could not load repositories. Check your GitHub session.",
            );
        }
    }

    function closePalette() {
        palette.style.display = "none";
    }

    // --------------------------------------------------
    // Keyboard shortcut
    // --------------------------------------------------

    document.addEventListener("keydown", (event) => {
        if (
            (event.metaKey || event.ctrlKey) &&
            !event.shiftKey &&
            !event.repeat &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();

            if (palette.style.display === "none") {
                openPalette();
            } else {
                closePalette();
            }
        }
    });

    // --------------------------------------------------
    // Initialization
    // --------------------------------------------------

    createPalette();

    // Load cache in the background.
    refreshRepositories().catch((error) => {
        console.warn("[Repo Palette]", error);
    });
})();
