# Staff Extension

Chrome extension that analyzes work time data from HTML tables and displays statistics.

## Features

- Automatically counts worked days and calculates expected vs actual hours
- Shows progress percentage and status (ahead/behind schedule)
- Displays results in compact 2-line format with emojis

## Installation

1. **Clone and setup**:

   ```bash
   git clone https://github.com/bagau/staff-extension.git
   cd staff-extension
   yarn install
   ```

2. **Configure target URL**:

   ```bash
   # Create .env file with your timetracker URL
   echo "EXTENSION_TARGET_URL=https://your-timetracker.company.com/staff/" > .env
   yarn build
   ```

3. **Load in Chrome**:
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → select project folder

## Commands

- `yarn build` - Generate manifest.json with your URL
- `yarn lint` - Check code quality

## How it works

Extension looks for tables with class `.time-tracker-table`, parses time data, calculates statistics based on 8-hour workdays, and displays results in element with ID `staff-difference`.

**Security**: Never commit `manifest.json` or `.env` files with sensitive URLs to public repositories.
