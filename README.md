# Vault 52 Security Terminal

A Fallout-themed, installable GitHub Pages site (PWA) for **Vault 52 Security** that helps members generate **copy/paste-ready Discord logs** (Patrol, Backup Requests, Inactivity, Discharge, Ammo Requests) with an optional patrol timer, history, and quick-reference rules.

## Features

### Duty Logs (Logs Terminal)
- **Patrol timer** (Start / End) with automatic duration
- Generates **Discord-ready formats** for:
  - Patrol Logs
  - Backup Requests
  - Inactivity Logs
  - Discharge Requests
  - Ammo Requests (with limits)
- **Copy to clipboard** button
- **Export to .txt**
- **History** saved locally (device-only)
- Saves your **Username / Rank / Timezone** locally so you don’t retype every time

### Rules Terminal (Rules / Foreign Affairs)
- Fallout-themed searchable reference page
- **Foreign Affairs** list with statuses (Allied / Neutral / Hostile / Enemy definitions)
- Quick “Rules” reference section (expandable)
- **Search + filters** for fast lookups
- Blacklists button links to Trello (external)

## Live Site
Once GitHub Pages is enabled, your site will be available here:
- GitHub Pages URL: (add your Pages URL here)

## Install as an App (PWA)
This site supports install as a desktop/mobile app.

**Chrome / Edge**
1. Open the site
2. Click **Install** in the address bar (or the in-site install button if shown)
3. Launch it like a normal app (runs standalone)

Offline support is included via the service worker cache.

## How to Use

### Patrol Log
1. Select **Patrol Log**
2. Press **Start Patrol**
3. Do your patrol
4. Press **End Patrol**
5. Add tasks/notes (optional)
6. Click **Generate Output**
7. Click **Copy** and paste into the Discord log channel  
   - Add screenshots separately if required by policy (or note `!STOPWATCH` usage)

### Backup Request
1. Select **Backup Request**
2. Choose priority (Medium / High)
3. Add notes
4. Generate and copy
5. Paste in Discord (includes `@Backup Request` line)

### Inactivity / Discharge / Ammo
Fill out the fields → Generate → Copy → Paste.

## Updating Foreign Affairs Statuses
Foreign Affairs data is stored in:

`/data/foreign-affairs.json`

Update the faction list/statuses there and commit to `main`. GitHub Pages will update automatically.

> Note: Statuses can change at any time even if faction owners do not request them.

## Blacklists
This project links to the official Trello board:
- https://trello.com/b/dkk0jEQJ/v52-vault-blacklists

**Important:** This repo is public when hosted on GitHub Pages. Avoid publishing sensitive/internal blacklist data unless leadership approves.

## File Structure

```txt
/
  index.html              # Logs terminal (timer + log generator)
  rules.html              # Rules / Foreign Affairs terminal
  styles.css              # Fallout terminal theme
  app.js                  # Logs terminal logic
  rules.js                # Rules terminal logic + search
  manifest.webmanifest    # PWA configuration
  service-worker.js       # Offline caching
  /data
    foreign-affairs.json  # Factions + definitions + quick rules
  /icons
    icon-192.svg
    icon-512.svg
