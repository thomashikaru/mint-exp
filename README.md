# Text Response Psychological Experiment

A simple, clean psychological experiment for collecting free-response text data from participants.

## Files

- `index.html` - Main experiment interface
- `styles.css` - Clean, responsive CSS styling
- `experiment.js` - JavaScript logic for experiment flow and data collection
- `dei10_list_1.csv` … `dei10_list_20.csv` - DEI10 stimulus lists (5 sentences each); list chosen via URL param `?list_id=1`–`20`
- `sample_texts.csv` - Example CSV (optional, for compatibility)
- `make_dei10_lists.py` - Script to regenerate list CSVs from `out/dei10/dei10_item_filtered.csv`
- `README.md` - This documentation

## Features

- **Clean, intuitive interface** with responsive design
- **Progress tracking** with visual progress bar
- **CSV data loading** support for easy text management
- **Data export** in JSON format with timestamps
- **Keyboard shortcuts** (Ctrl/Cmd + Enter to submit)
- **Mobile-friendly** responsive design

## Usage

The experiment must be served over HTTP (e.g. GitHub Pages or a local server). Loading `index.html` via `file://` will fail because the browser blocks `fetch()` of the CSV files.

- **GitHub Pages (recommended):** See “Deploying to GitHub Pages” below. The site will be at `https://<username>.github.io/<repo>/` (and e.g. `?list_id=7` for list 7).
- **Local server:** From the `exp` directory run `python -m http.server 8000` and open `http://localhost:8000`.

Then: enter a participant ID, complete the 5 sentences for your list, and download the JSON results (or use the completion code if you collect data elsewhere).

## Customizing Text Data

### Using CSV Files

To use your own text data:

1. Create a CSV file with columns: `id,text`
2. Modify the JavaScript to load your CSV:

```javascript
// In experiment.js, replace loadDummyData() call with:
experiment.loadFromCSV('your_texts.csv');
```

### CSV Format

```csv
id,text
1,"Your first text here"
2,"Your second text here"
3,"Your third text here"
```

## Customization Options

### Styling
- Modify `styles.css` to change colors, fonts, layout
- All styles use CSS custom properties for easy theming

### Experiment Flow
- Adjust timing, validation rules in `experiment.js`
- Add additional data collection fields
- Modify the response format

### Data Collection
- Responses are saved with timestamps and text IDs
- JSON export includes all metadata
- Easy to extend with additional participant data

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers supported
- No external dependencies required

## Deploying to GitHub Pages

The repo is set up to deploy this experiment as a static site (HTML + JS + CSS + CSV, no server required).

1. **Enable Pages:** In the GitHub repo go to **Settings → Pages**. Under “Build and deployment”, set **Source** to **GitHub Actions**.
2. **Deploy:** Pushes that change anything under `exp/` (or the workflow file) trigger `.github/workflows/deploy-exp-pages.yml`, which publishes the contents of `exp/` as the site root.
3. **Open the site:** After the action runs (Actions tab), the experiment is at `https://<username>.github.io/mint/`.
4. **List assignment:** Use `?list_id=k` (1–20) to assign a stimulus list, e.g. `https://<username>.github.io/mint/?list_id=5`. Default is list 1.

No separate HTTP server is needed; GitHub Pages serves the static files.

## Future Enhancements

- Time tracking for responses
- Server-side data storage
- Multiple experiment conditions
