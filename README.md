# Userscripts

A collection of userscripts. Userscripts are small JavaScript programs that run
in your browser to modify web pages to your liking.

## Installation

1. Install a userscript manager extension for your browser:
    - [Violentmonkey](https://violentmonkey.github.io/get-it/)
    - [Tampermonkey](https://www.tampermonkey.net/)
2. Navigate to the source of the userscript you want to install.
3. Copy the entire source code.
4. Open the userscript manager extension and create a new userscript.
5. Paste the source code into the userscript.
6. Save the userscript.

## Userscripts

<details>
<summary><strong>Clyp Autoplayer</strong></summary>

Automatically plays audio on [Clyp](https://clyp.it/), and ensures that only
one audio player is playing at a time.

[Source](./clyp-autoplayer.js)

This script is intended for follow-along stories that provide background music
via Clyp. It will automatically repeat the audio when it ends, and will close
previous tabs when a new audio player is started.

</details>

<details>
<summary><strong>Discord Hide Buttons</strong></summary>

Hides unwanted buttons in Discord's UI, such as the GIF picker, the Send Gift
button, the Server Boost button, and others.

[Source](./discord-hidebuttons.js) **NOTE: Requires Customization**

Can hide or show the following:

-   Send a gift button in chatbox
-   GIF picker button in chatbox (Can still send GIFs via emoji picker)
-   Sticker picker button in chatbox (Can still send stickers via emoji picker)
-   Emoji picker button in chatbox
-   Super Reactions on message and context menus

</details>

<details>
<summary><strong>YouTube Music Auto Skip</strong></summary>

Automatically skips songs on YouTube Music depending on user-defined rules.

[Source](./youtubemusic-autoskip.js) **NOTE: Requires Customization**

Can automatically skip songs based on title or artist.

</details>

<details>
<summary><strong>LP Archive Dark Mode</strong></summary>

Adds a dark mode to the [LP Archive](https://lparchive.org/).

[Source](./lparchive-darkmode.js)

</details>

## License

Licensed under the [MIT License](./LICENSE).
