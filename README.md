# Staff Time Tracker Extension

A Chrome browser extension that analyzes work time data from HTML tables and provides detailed statistics about your working hours.

## Features

- 📊 **Work Time Analysis**: Automatically counts actual worked days from time intervals
- 🎯 **Progress Tracking**: Calculates expected vs actual hours (8 hours per day standard)
- 📈 **Real-time Statistics**: Shows progress percentage and current status (ahead/behind schedule)
- 🎨 **Visual Indicators**: Color-coded progress with green/red indicators
- 📋 **Compact Report**: Clean 2-line summary with emojis and formatted data

## What it does

The extension analyzes work time tables on company timetracker pages and displays:

1. **Work Summary**: Number of days worked and total planned hours
2. **Progress Report**: Actual hours worked, completion percentage, and status
3. **Status Information**: Whether you're ahead or behind schedule with exact time difference

### Example Output

```
📊 Work Time: 15 days worked | plan 120h
🎯 Progress: 125:30h actual • 104.6% • ahead by 5:30
```

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

### For Development (with custom URL)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/bagau/staff-extension.git
   cd staff-extension
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure your target URL**:

   ```bash
   # Option 1: Use environment variable
   export EXTENSION_TARGET_URL="https://your-timetracker.company.com/staff/"
   npm run build

   # Option 2: Use development script with inline URL
   EXTENSION_TARGET_URL="https://your-timetracker.company.com/staff/" npm run dev
   ```

4. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project directory
   - The extension will now work on your configured URL

### For Production Deployment

Create a `.env` file with your production settings:

```bash
cp .env.example .env
# Edit .env with your actual values
npm run build
```

**Security Note**: Never commit `manifest.json` or `.env` files with sensitive URLs to public repositories.

### Method 2: Manual Installation

1. Download all files from this repository
2. Place them in a dedicated folder
3. Follow steps 2-5 from Method 1 above

## File Structure

```
staff-extension/
├── manifest.json       # Extension configuration
├── content.js          # Main functionality and time analysis
└── README.md          # This file
```

## How it Works

The extension automatically:

1. **Detects Time Tables**: Looks for tables with class `.time-tracker-table`
2. **Parses Work Data**: Extracts time intervals and daily totals
3. **Calculates Statistics**: Computes expected hours based on 8-hour workdays
4. **Displays Results**: Shows information in element with ID `staff-difference`

## Technical Details

- **Target**: HTML tables with time tracking data
- **Format**: Supports time format `HH:MM` (e.g., "08:30")
- **Standard**: 8 hours per working day
- **Display**: Injects results into existing page elements

## Browser Compatibility

- ✅ Chrome (Chromium-based browsers)
- ✅ Edge (Chromium version)
- ❓ Firefox (may require manifest adjustments)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Development

The code is well-structured with separate functions for:

- Data parsing (`parseWorkingTimeData`)
- Statistics calculation (`calculateWorkStatistics`)
- Report rendering (`renderWorkReport`)
- Status calculation (`calculateProgressStatus`)

## License

This project is open source. Feel free to use and modify as needed.

## Support

If you encounter any issues or have suggestions:

1. Check if your timetracker page has the expected HTML structure
2. Open browser developer tools (F12) and check the console for errors
3. Create an issue on GitHub with details about your setup

---

**Note**: This extension is designed for specific timetracker page layouts. You may need to adjust selectors in `content.js` for different table structures.
