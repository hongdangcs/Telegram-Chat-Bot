
## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

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
     tradingView: sessionid_sign: your_tradingview_sessionid_sign,
     tradingView: sessionid: your_tradingview_sessionid,
     telegram: botToken: your_bot_api_token,
     ssi: consumerID: your_ssi_consumer_id,
     ssi: consumerSecret: your_ssi_consumer_secret,
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
