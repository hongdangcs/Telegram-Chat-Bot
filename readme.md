
## How it works

- Candles come straight from TradingView's data feed (no browser), up to 5,000 bars per chart.
- The similar-pattern search from `tradingviewscripts.txt` runs in Node (`analysis/`): it finds past bars whose Ichimoku Cloud and Stochastic RSI state matches the latest bar and counts how often the price rose 1, 2 and 3 bars later.
- Charts and the SSI Market Depth view are drawn with `@napi-rs/canvas` (`render/`).

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)

### TradingView session (optional)
Charts work without a TradingView account. To use your account's data subscription, or to run `scripts/compare-with-tradingview.js`:
   - Log in to https://www.tradingview.com/ and open *Developer Tools* (**Ctrl + Shift + I**).
   - Navigate to the *Application* Tab.
   - On the left sidebar, under the *Cookies* section, select *https://www.tradingview.com*.
   - Save value of *sessionid_sign* and *sessionid*.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/hongdangcs/Telegram-Chat-Bot.git
   cd Telegram-Chat-Bot
   ```

2. **Install the dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `configs.js` similar to `configs.js.example` at the root directory with your configuration.
   - Fill the following variables:
     ```configs
     telegram > botToken: your_bot_api_token,
     ssi > consumerID: your_ssi_consumer_id,          (Market Depth)
     ssi > consumerSecret: your_ssi_consumer_secret,  (Market Depth)
     tradingView > sessionid_sign: your_tradingview_sessionid_sign,  (optional)
     tradingView > sessionid: your_tradingview_sessionid,            (optional)
     ```
   - On Linux servers, install a font package (e.g. `fonts-dejavu`) so chart labels render.

### Usage

1. **Starting the Server**:

   ```bash
   node main.js
   ```

2. **Interacting with the Bot**:
   - Open Telegram and start a chat with your bot.
   - Use commands like `/list`, `/s [stock_name]`, `/help`, etc.
   - After choosing a time interval, `/similar` steps back through the past setups that matched.

### Checking results against TradingView

With your TradingView session in `configs.js`, this compares the Node indicators with TradingView's built-in Stochastic RSI and Ichimoku Cloud. If `tradingviewscripts.txt` is saved in your Pine Editor, it also runs that script and compares the up/down counts:

```bash
node scripts/compare-with-tradingview.js HOSE:FPT 1h
```
