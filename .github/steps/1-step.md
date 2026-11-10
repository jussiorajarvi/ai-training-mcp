# Module 8 Exercise — MCP Tools in Practice

This exercise has three parts. Part 0 is a warm-up where you discover what MCP tools are available. Part 1 teaches you how to use Playwright MCP for UI verification. Part 2 shows you how Context7 improves coding accuracy when APIs change after your training data.

<!-- github-only -->
## Setup — clone your copy

Clone your copy of this repository (the one created from the template) to your computer and open it in a terminal:

```
git clone <URL of your copy>
cd <name of your repo>
```

You can copy the URL from the green **Code** button on your repository page.
<!-- /github-only -->
<!-- mcp-only
## Setup

Claude has already written the starter files into this folder. Open a terminal here.
-->

---

## Part 0: Discover MCP tools (warm-up)

### Objective
Get familiar with the MCP ecosystem and what tools are available beyond the most common ones.

### Task
1. Search for "MCP servers" or "Model Context Protocol tools" online
2. Find 3-4 MCP tools you haven't heard of
3. For each tool, read its documentation or description
4. For each tool, write one sentence about what it does and when you might use it

Examples of tools to look for (but find your own too):
- Tools for specific cloud platforms (AWS, GCP, Azure)
- Tools for communication platforms (Slack, Discord, email)
- Tools for data or analytics services
- Tools for monitoring or observability systems

---

## Part 1: Playwright MCP — Debugging failing e2e tests

### Objective
Install Playwright MCP, run a React app with failing e2e tests, and use Claude with Playwright to diagnose why the tests are failing by observing what the app actually does.

### Setup
1. In Claude Code, use `/plugin` to search for "Playwright MCP"
2. Install the plugin (if it requires authentication, follow the setup steps)
3. After installation, use `/reload-plugins` to load the new plugin into the current session

### Running on Linux?
The e2e tests use Playwright's bundled Chromium on Linux, even if Google Chrome is installed. After `npm install`, run `npx playwright install --with-deps chromium` to install the browser and its system dependencies.

### Running Claude Code in a Docker Sandbox?
Give this repo its own sandbox, created from the repo folder, and keep everything in it: the app, the e2e tests and Claude all need to share its `localhost`. A sandbox you created earlier, such as `my-sandbox` from Module 0, only sees the folder it was created in. The commands below call the new sandbox `module-8`.

The sandbox has no Google Chrome, which the Playwright plugin uses by default, so set up a browser once before you start.

1. On your computer, in your copy of the repo, create the sandbox and start Claude Code in it. Install the Playwright plugin there, as in **Setup** above:
   ```
   sbx run --name module-8 claude
   ```
2. In a second terminal on your computer, also in your copy of the repo, open a shell in the sandbox. `-w "$PWD"` starts it in the repo folder, which has the same path inside the sandbox:
   ```
   sbx exec -it -w "$PWD" module-8 bash
   ```
3. In that sandbox shell, install the packages, then the browsers and the system libraries they need. Run `npm install` here even if you already ran it on your computer: packages installed on macOS or Windows don't work in the sandbox's Linux.
   ```
   npm install
   npx playwright install --with-deps chromium
   npx @playwright/mcp@latest install-browser chrome-for-testing
   ```
4. Tell the plugin to use that browser without a display. Add this to `~/.claude/settings.json` inside the sandbox, next to the settings already there:
   ```json
   "env": {
     "PLAYWRIGHT_MCP_BROWSER": "chromium",
     "PLAYWRIGHT_MCP_HEADLESS": "true"
   }
   ```
5. Exit Claude Code and start it again (`sbx run --name module-8`).

Run the app and the tests from the sandbox shell. To also open the app in your own browser, publish its port on your computer:
```
sbx ports module-8 --publish 5173:5173
```
Then start the app in the sandbox shell with `npm run dev -- --host 0.0.0.0`, so it accepts connections from outside the sandbox, and open http://localhost:5173. If the page doesn't load, run `sbx ls` on your computer: another sandbox may already publish port 5173. Stop it with `sbx stop <its name>`.

If a download fails, your sandbox's firewall may be blocking it. Allow the hosts that the browser downloads, the system libraries and the app's pet images come from:
```
sbx policy allow network --sandbox module-8 cdn.playwright.dev,playwright.download.prss.microsoft.com,storage.googleapis.com,ports.ubuntu.com,images.pexels.com
```
If something still doesn't work, ask in the course support channel rather than letting Claude change the sandbox's network settings.

#### Want to watch the browser? Run Playwright MCP on your computer instead
The browser above runs inside the sandbox without a window, so you only see what Claude reports. Your own browser tab doesn't show Claude's clicks either: it's a separate browser, and it shows Claude's changes only when you reload it. To watch Claude click through the app, run the Playwright MCP server on your own computer (this needs Node.js there) and let Claude in the sandbox use it. You still use one Claude Code session, in the sandbox.

> **Watch out:** This gives up some isolation. The browser runs on your computer, outside the sandbox, and Claude controls it. It uses a fresh profile, not your own browser, but it can reach anything your computer can, including internal sites. Claude's code and commands stay in the sandbox.

1. In a new terminal on your computer, not in the sandbox, start the server. The first time, npx asks to install `@playwright/mcp`: answer `y`. Leave the terminal open, since the server stops when you close it.
   ```
   npx @playwright/mcp@latest --port 8931 --allowed-hosts localhost:8931,host.docker.internal:8931
   ```
2. In the sandbox shell, tell Claude Code to use that server. If you installed the Playwright plugin, disable it first, so Claude doesn't use the headless browser instead:
   ```
   claude plugin disable playwright@anthropic-plugin-directory
   claude mcp add --scope user --transport http playwright-host http://host.docker.internal:8931/mcp
   ```
3. Publish port 5173 and start the app with `--host 0.0.0.0`, as above. Then restart Claude Code and check with `/mcp` that `playwright-host` is connected.

The prompts below work as written: `http://localhost:5173` on your computer leads to the app in the sandbox. If your sandbox's firewall blocks the connection, allow it with `sbx policy allow network --sandbox module-8 host.docker.internal:8931`.

### Task
1. Run your React app locally.
 1.1 Install the packages with `npm install`
 1.2 List all the commands under `npm run` by running just that command.
 1.3 Do `npm run dev` or `npm run preview` work? How about `lint`, `typecheck` or `test:unit`?
2. Run the e2e tests and let them fail (don't debug yet) (`npm run test:e2e`)
3. ** Optional: try to fix the code yourself **
4. Ask Claude to:
    - Use Playwright to navigate to the app
    - Perform the same interactions the tests do
    - Fix the test by modifying the code

Example prompt:
> I have a failing e2e test. The app is running at http://localhost:5173. Please use Playwright to:
> 1. Navigate to the app
> 2. Perform the same interactions the test does
> 3. Fix the test by modifying the code

### Debrief
After Claude diagnoses the issue, ask yourself:
- What did Claude observe with Playwright that you couldn't see by reading the test code alone?
- Would you have spotted the issue faster by having Claude navigate the app visually?
- How much time would Claude have saved you compared to manually reproducing the test steps?

---

## Part 2: Context7 — Documentation-assisted coding with API changes

### Objective
Install Context7, implement a function using a library that had significant API changes after Claude's training cutoff, and see how live documentation prevents outdated code.

### Task
1. Application has outdated dependencies.
2. Ask Claude to create a migration plan for the dependencies to docs/MigrationPlan.md.
3. Use `/clear` to clear context.
4. In Claude Code, use `/plugin` to search for "Context7"
5. Install the plugin (it requires no additional authentication)
6. After installation, use `/reload-plugins` to load the new plugin into the current session
7. Ask Claude to use Context7 and to create a migration plan for the dependencies to docs/MigrationPlanWithContext7.md.
8. Ask Claude to compare the two migration plans.

### Tips
Your Docker Sandbox may have a firewall in place that prevents using Context7 MCP. You can allow access to it with the following command:
```
sbx policy allow network --sandbox my-sandbox mcp.context7.com
```

### Debrief
After comparing the two migration plans (MigrationPlan.md vs. MigrationPlanWithContext7.md), ask yourself:

- How did the two migration plans differ?
- Were there breaking changes in the newer versions that Claude missed in the first plan but caught with Context7?
- Did Context7 help Claude discover newer, better patterns or APIs?
- Which migration plan would you be more confident following in a real project and why?

---

<!-- github-only -->
### Automated Checks
The CI pipeline will verify:
- Tests pass
- docs/MigrationPlan.md exists
- docs/MigrationPlanWithContext7.md exists

<details>
<summary>Having trouble? 🤷</summary><br/>

**Part 1 (Playwright MCP):**
* If Playwright MCP won't install, check that you're using `/plugin` in Claude Code and not trying to install manually.
* If the plugin loads but tests still fail after Claude's fixes, paste the full error output and ask Claude to observe the app with Playwright to diagnose further.
* If Playwright can't interact with the app (buttons not clickable, selectors not found), the app may not be running. Verify `npm run dev` is still executing and the correct port is in the Playwright config.
* If the Playwright config has the wrong base URL or port, update it and re-run the tests.
* **Windows:** if `npx playwright install` or `npm run test:e2e` hangs after a browser download completes, you shouldn't need to wait it out — the config already runs the `chromium` project against your system-installed Chrome on Windows and macOS instead of downloading Playwright's bundled browser, so a working Chrome install is all you need.
* **Docker Sandbox:** if Playwright says Chrome or a browser "is not installed", or "Missing system dependencies", follow **Running Claude Code in a Docker Sandbox?** above.
* **Docker Sandbox:** if `npm run dev` says `Missing script: "dev"`, or `sbx exec` says `No such file or directory`, the sandbox wasn't created from your copy of the repo, or the shell isn't in the repo folder. Follow steps 1 and 2 of **Running Claude Code in a Docker Sandbox?** above.

**Part 2 (Context7):**
* If Context7 won't install, check that you've selected the correct plugin in `/plugin`.
* If Context7 finds outdated docs or the migration plan seems incomplete, ask Claude to search for breaking changes in the CHANGELOG or release notes of each library.

**General:**
* Make sure to use `/reload-plugins` after installing a plugin so Claude can access it in the current session.
* If you're stuck, paste the error message or full test output and ask Claude what you should fix.
* If you still need help, ask in the course support channel.

</details>


---

<img alt="Amin 2.0" src="../images/amin2_smile.png" align="right" height="125px" />

Please, follow the steps above.
I'll watch your progress in the background to provide feedback. 🧐
<!-- /github-only -->
<!-- mcp-only
When you are done, ask me to check your solution.
-->
