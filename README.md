# Netlify Deployment Package

## Setup

1. **Environment Variable**: In Netlify dashboard, set `WEBHOOK_URL` to your Discord Webhook URL.

2. **Install and Build Functions**:
   ```bash
   npm install
   npm run build
   ```
   This generates `.netlify/functions` ready for deployment.

3. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod --dir=. --functions=.netlify/functions
   ```

## Directory Structure

```
├── index.html
├── script.js
├── style.css
├── levels.html
├── Reading_Time.html
├── netlify/
│   └── functions/
│       └── send-audio.js
├── package.json
├── netlify.toml
└── README.md
```

Once deployed, recording audio and pressing the stop button will send your audio via Netlify Function to Discord Webhook, bypassing CORS.
