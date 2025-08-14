# sorbet.rip - anonymous imageboard

a minimal, 4chan-style imageboard built with vanilla html, css, and javascript. no backend required - everything runs in the browser using localStorage.

## features

- **5 boards**: `/g/` (tech), `/b/` (random), `/pol/` (politics), `/rtd/` (retards), `/cmp/` (complaints)
- **thread creation & replies** with optional image uploads
- **4chan-style formatting**: green text (`>`), quote links (`>>`), bold, italic, code
- **localStorage persistence** - no backend needed
- **responsive design** for mobile and desktop
- **4 themes**: dark (default), light, classic 4chan, terminal
- **konami code easter egg** - try the arrow key sequence!
- **random MOTD quotes** with internet humor
- **auto-refresh** for threads
- **keyboard shortcuts** (ctrl+r, ctrl+n, escape)

## deployment

### github pages

1. **create repository**:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sorbet.rip.git
   git push -u origin main
   ```

2. **enable github pages**:
   - go to repository settings
   - scroll to "pages" section
   - select "deploy from a branch"
   - choose "main" branch and "/ (root)" folder
   - click "save"

3. **custom domain** (optional):
   - in repository settings → pages
   - add your domain to "custom domain" field
   - create a `CNAME` file in the root with your domain
   - update your DNS to point to `yourusername.github.io`

### local development

```bash
# start local server
python -m http.server 8000

# or with node
npx serve .

# visit http://localhost:8000
```

## usage

### creating threads
1. click on any board (e.g., `/g/`)
2. click "new thread"
3. fill out subject, name (optional), and comment
4. optionally upload an image (max 5MB)
5. click "create thread"

### posting replies
1. click on any thread
2. click "reply"
3. fill out name (optional) and comment
4. optionally upload an image
5. click "post reply"

### formatting
- **green text**: start lines with `>`
- **quote links**: use `>>postnumber` to link to posts
- **bold**: wrap text in `**bold**`
- **italic**: wrap text in `*italic*`
- **code**: wrap text in `` `code` ``

### themes
click the "theme" button in the top navigation to switch between:
- **dark**: black background, white text, red accents
- **light**: white background, black text, red accents
- **classic**: original 4chan blue theme
- **terminal**: green text on black (matrix-style)

### keyboard shortcuts
- `ctrl+r`: refresh current page
- `ctrl+n`: new thread (on board) or reply (in thread)
- `escape`: hide forms/close dropdowns

## customization

### adding quotes
edit `js/quotes.js` to add your own MOTD quotes:

```javascript
const MOTD_QUOTES = [
    "your quote here",
    "another quote",
    // ... more quotes
];
```

### modifying boards
edit `js/storage.js` in the `getDefaultBoards()` function:

```javascript
getDefaultBoards() {
    return {
        'yourboard': {
            name: '/yourboard/',
            title: 'your title',
            description: 'your description',
            postCount: 0,
            threadCount: 0
        },
        // ... other boards
    };
}
```

### changing themes
edit `css/main.css` to modify the color schemes in the `:root` and theme selectors.

## file structure

```
sorbet.rip/
├── index.html          # main page
├── board.html          # board catalog view
├── thread.html         # individual thread view
├── css/
│   ├── main.css        # main styles
│   └── responsive.css  # responsive design
├── js/
│   ├── main.js         # app initialization
│   ├── storage.js      # localStorage management
│   ├── posts.js        # post/thread handling
│   └── quotes.js       # MOTD quotes
├── images/
│   └── favicon.png     # site favicon
└── README.md           # this file
```

## browser compatibility

- **chrome**: ✅ fully supported
- **firefox**: ✅ fully supported
- **safari**: ✅ fully supported
- **edge**: ✅ fully supported
- **mobile browsers**: ✅ responsive design

## limitations

- **localStorage limits**: ~5-10MB per domain
- **image size**: max 5MB per image
- **no real-time updates**: manual refresh required
- **no user accounts**: anonymous posting only
- **no moderation tools**: basic post deletion only

## development

### adding features
- **new boards**: modify `storage.js` → `getDefaultBoards()`
- **new themes**: add CSS variables in `main.css`
- **new formatting**: extend `posts.js` → `formatPostContent()`
- **new shortcuts**: add to `main.js` → `handleKeyboardShortcuts()`

### debugging
- open browser dev tools
- check console for errors
- inspect localStorage: `localStorage.getItem('sorbet_boards')`
- clear data: `localStorage.clear()`

## license

this project is open source. feel free to modify and distribute.

---

**sorbet.rip** - where the internet still feels like the internet
