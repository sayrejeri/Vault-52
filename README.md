# Vault 52 Security Terminal

A Fallout-themed, installable **web terminal & PWA** for the Vault 52 community.  
Designed to streamline **Security operations, patrol logging, booth processing, and quick-reference lookups** with fast, copy/paste-ready outputs for Discord and in-game use.

This project is built to feel like an authentic **Vault-Tec terminal** while remaining practical, fast, and easy to use during live gameplay.

---

## 🌐 Live Site
https://sayrejeri.github.io/Vault-52
> If you have any questions my discord is `sayrejeri` or ingame name `ROBLOXjeremiahkorben`

## 📱 Install as an App (PWA)
The terminal can be installed as a desktop or mobile app.

**Chrome / Edge**
1. Open the site
2. Click **Install** in the address bar (or use the in-site install option)
3. Launch it like a native app (runs standalone)

Offline support is included via service worker caching.

---

## 👥 Credits & Contributors

This project was created and is maintained by members of the **Vault 52 community**, with the goal of improving day-to-day operations, consistency, and usability for Security and staff.

**Project Lead / Implementation**
- **SayreJeri** — Concept, design, development, UI/UX, and ongoing maintenance

**Documentation & Source Material**
- **Jxst_Ink** — Security handbooks, event handbooks, procedures, and policy documentation
- **Void** — Security structure and procedural foundations
- **AlexDeviation** — Formations guide and training documentation

**Community & Testing**
- Vault 52 Security Division members and staff who provided feedback, testing, and real-world usage insights. (Please DM me if anything is not suppose to be on here or if you have a suggestion.)

---

This terminal is a community-driven tool and will continue to evolve as procedures, policies, and needs change.

---

## 🔹 Features

### 🛡️ Duty Logs (Logs Terminal)
- **Patrol timer** with Start / End and automatic duration
- Generates **Discord-ready log formats** for:
  - Patrol Logs
  - Backup Requests
  - Inactivity Logs
  - Discharge Requests
  - Ammo Requests (with enforced limits)
- **One-click copy to clipboard**
- **Export logs to `.txt`**
- **Local history** (saved per device)
- Saves **Username / Rank / Timezone** locally
- **Booth Script panel** (Patrol Log only):
  - Quick-copy chat phrases for Vault entry processing  
    (Name, Reason, Weapons, Weapon Use, Welcome)

### 📜 Rules Terminal
- Fallout-style **quick-reference rules terminal**
- Covers:
  - Security decorum
  - General rules
  - Force levels
  - Detain tool usage
  - Vault threat levels
  - Area restrictions
  - Logging formats
  - Jail caps & enforcement summaries
- **Searchable and filterable**
- Clickable links to official public documents
- Designed for **operational reference**, not walls of text

### 🌐 Foreign Affairs Terminal
- Centralized **Foreign Affairs lookup**
- Displays:
  - Faction name
  - Status (Allied / Neutral / Hostile / Enemy)
  - Owner (if applicable)
  - **“As of” dates** per faction
- **Visual status indicators** for fast recognition
- Definitions included directly on the page
- Search, filter, and sort support

### 📚 Public Documents
- Links to official public handbooks and guides
- Clean separation between:
  - Terminal summaries
  - Full external documentation

---

## 🧭 How to Use

### Patrol Log
1. Select **Patrol Log**
2. Click **Start Patrol**
3. Perform your patrol
4. Click **End Patrol**
5. Add notes or checklist items (optional)
6. Click **Generate Output**
7. Copy and paste into the appropriate Discord channel

### Booth Script (Patrol Log)
- Click any booth button to copy a phrase
- Paste directly into Roblox chat
- Buttons can be used in **any order**

### Backup Request
1. Select **Backup Request**
2. Choose priority (Medium / High)
3. Add notes
4. Generate and copy
5. Paste into Discord (includes `@Backup Request`)

### Inactivity / Discharge / Ammo
Fill in the fields → Generate → Copy → Paste.

---

## 🗂️ Updating Foreign Affairs Data

Foreign Affairs data is stored in:

`/data/foreign-affairs.json`

- One entry per faction
- Each faction includes its own **“as of” date**
- Commit updates to `main` and GitHub Pages updates automatically

> Note: Statuses can change at any time even if faction owners do not request them.

---

## 🔗 External Resources
- Vault Blacklists  
  https://trello.com/b/dkk0jEQJ/v52-vault-blacklists

- Vault Laws  
  https://trello.com/b/4TuCRbuQ/v52-vault-laws

---

## 📁 Project Structure


Update the faction list/statuses there and commit to `main`. GitHub Pages will update automatically.

> Note: Statuses can change at any time even if faction owners do not request them.

## Blacklists
This project links to the official Trello board:
- https://trello.com/b/dkk0jEQJ/v52-vault-blacklists

**Important:** This repo is public when hosted on GitHub Pages. Avoid publishing sensitive/internal blacklist data unless leadership approves.

## File Structure

```txt
/
  index.html              # Logs terminal (timer + log generator + booth script)
  foreign.html            # Foreign Affairs terminal
  documents.html          # Public documents hub
  rules.html              # Rules terminal
  styles.css              # Fallout terminal theme
  theme.js                # Global theme handler (Green / Amber
  app.js                  # Logs terminal logic
  foreign.js              # Foreign Affairs logic
  rules.js                # Rules terminal logic + search
  documents.js            # Documents page logic
  manifest.webmanifest    # PWA configuration
  service-worker.js       # Offline caching
  /data
    foreign-affairs.json  # Factions + definitions + statuses
  /icons
    icon-192.svg
    icon-512.svg
```
    
---

## 🧪 Status
This project is **actively used and maintained**.  
Built to be fast during gameplay, easy to update, and flexible for future expansion.

> If you have any questions my discord is `sayrejeri` or ingame name `ROBLOXjeremiahkorben`

