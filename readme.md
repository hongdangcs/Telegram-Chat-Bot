
## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Configure TradingView account
1. **Create a new TradingView account**
   - Go to https://www.tradingview.com/ and create a new account or log in to your existing account.
   - Navigate to the chart page of any stock. For example: https://www.tradingview.com/chart/?symbol=BITSTAMP%3ABTCUSD
2. **Configure chart page**
- **Add custom Pine Script**
   - Open *Pine Editor* tab by clicking on ***Pine Editor*** in the bottom bar.
   - Delete all the default script in the *Pine Editor*.
   - Copy all the content from the tradingviewscripts.txt file in the project source and paste it into the Pine Editor.
   - Add script to chart by click on ***Add to chart*** place on the top right of script editor.
   - Close *Pine Editor* tab by clicking on ***Pine Editor*** again.
- **Add Stochastic RSI Script**
   - Click on ***Indicator*** in the top bar.
   - Search for ***Stochastic RSI*** and click on it.
   - Close the *Indicator* tab.
- **Save layout**
  - Press *Ctrl + S* to save the current layout
  - Click on the *Manage Layout* collapse button **▽** in the top right bar of chart page.
  - Disable **Auto Save**
3. **Retrieve sessionid_sign and sessionid**
   - Open *Developer Tools* by pressing **Ctrl + Shift + I**.
   - Navigate to the *Aplication* Tab.
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
     tradingView > sessionid_sign: your_tradingview_sessionid_sign,
     tradingView > sessionid: your_tradingview_sessionid,
     telegram > botToken: your_bot_api_token,
     ssi > consumerID: your_ssi_consumer_id,
     ssi > consumerSecret: your_ssi_consumer_secret,
     ```

### Usage

1. **Starting the Server**:

   ```bash
   node main.js
   ```

2. **Interacting with the Bot**:
   - Open Telegram and start a chat with your bot.
   - Use commands like `/list`, `/s [stock_name]`, `/help`, etc.
````
