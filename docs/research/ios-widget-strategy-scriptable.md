# Research: iOS Widget Strategy via Scriptable

## Objective
To provide a low-friction, zero-cost way to have interactive iOS widgets for the Hub (Personal OS) without building a full native app or paying for the Apple Developer Program ($99/year).

## Why Scriptable?
[Scriptable](https://scriptable.app/) is a free iOS app that allows users to write JavaScript that runs natively on iOS and can power Home Screen widgets. 

### Benefits:
- **Cost:** $0.
- **Speed:** Can be implemented in minutes.
- **Interactivity:** Can trigger "Quick Actions" (Log water, SOS) via API calls.
- **Native Feel:** Supports Small, Medium, and Large widget sizes.

---

## Implementation Architecture

### 1. The Backend (Next.js Hub)
We need a dedicated API route to serve data to the widget.
- **Endpoint:** `/api/system/recovery/status`
- **Security:** Use a `WIDGET_SECRET` header for authentication.
- **Payload:** 
  ```json
  {
    "status": "CRISIS_STABILIZATION",
    "phaseName": "Phase 1: Stabilization",
    "score": 65,
    "nextTask": "15 min walk",
    "isCrisis": true
  }
  ```

### 2. The Scriptable Code (Draft)
This JavaScript would be pasted into the Scriptable app on the iPhone.

```javascript
// Hub Widget Script
const API_URL = "https://your-hub-domain.com/api/system/recovery/status";
const SECRET = "your_shared_secret";

let data = await fetchData();
let widget = createWidget(data);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();

async function fetchData() {
  let req = new Request(API_URL);
  req.headers = { "Authorization": `Bearer ${SECRET}` };
  return await req.loadJSON();
}

function createWidget(data) {
  let w = new ListWidget();
  w.backgroundColor = new Color("#1c1c1e");
  
  let title = w.addText("🛡️ HUB OS");
  title.font = Font.blackMonospacedSystemFont(12);
  title.textColor = new Color("#8e8e93");
  
  w.addSpacer(8);
  
  let status = w.addText(data.phaseName);
  status.font = Font.boldSystemFont(18);
  status.textColor = data.isCrisis ? Color.red() : Color.green();
  
  w.addSpacer(4);
  
  let progress = w.addText(`Progress: ${data.score}%`);
  progress.font = Font.mediumSystemFont(14);
  
  w.addSpacer(10);
  
  let next = w.addText(`👉 Next: ${data.nextTask}`);
  next.font = Font.italicSystemFont(12);
  next.textColor = new Color("#ffffff", 0.8);
  
  // URL to open the app on click
  w.url = "https://your-hub-domain.com/home";
  
  return w;
}
```

---

## Future Ideas for Widgets
1. **SOS Widget (Small):** A single red button that occupies a 2x2 grid. Clicking it triggers the SOS API and opens the Hub.
2. **Nutrition Widget (Medium):** Shows remaining Calories/Protein for the day.
3. **Language Widget (Small):** Shows a "Word of the Day" from the Vocabulary Space.

## Security Considerations
Since this bypasses standard NextAuth sessions:
- Use a long, random UUID as a `WIDGET_SECRET`.
- Limit the API to only allow "Check" actions and "Read Status". Do not allow sensitive data exports via this secret.
