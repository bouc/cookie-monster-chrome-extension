# Cookie Monster Chrome Extension

A developer tool for viewing and exporting website cookies for testing and debugging purposes.

## Features

- 🍪 Extract all cookies from any website
- 📋 Copy individual cookies or all at once
- 💾 Download cookies as a text file
- 🔄 Clean, scrollable interface
- 🎯 Organized display with priority cookies first

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension folder

## Usage

1. Navigate to any website
2. Click the Cookie Monster extension icon
3. Click "Extract" to fetch all cookies
4. View, copy, or download the cookie data
5. Click "Clear" to reset

## Cookie Display Order

The extension displays cookies in this order:
1. sessionid
2. csrftoken
3. datr
4. ds_user_id
5. ig_did
6. mid
7. rur
8. wd
9. Other cookies (alphabetically)
10. User Agent (at the bottom)

## Privacy

- ✅ All data stays local on your device
- ✅ No data is transmitted to external servers
- ✅ Cookies are only accessed when you click "Extract"
- ✅ Data is stored temporarily in Chrome's local storage

## Permissions

- `activeTab`: Access the current tab when you click the extension
- `cookies`: Read cookies from websites
- `storage`: Save extracted data locally in your browser

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Main functionality
- `styles.css` - Styling
- `background.js` - Background service worker
- `icon.png` - Extension icon

## Development

This extension uses Manifest V3 and is compliant with Chrome Web Store policies.

## Author

**Christien Bouc**
- Website: [christienbouc.com](https://christienbouc.com)
- GitHub: [github.com/bouc](https://github.com/bouc)

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This tool is intended for developers and testers. Use responsibly and only on websites you have permission to access.

