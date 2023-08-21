# Arb Check Console Application

Arb Check Console Application is a CLI tool designed to fetch sports betting data from various bookmakers using the Arb Check backend. It identifies arbitrage opportunities by sorting games based on their margins. It's designed to be used with the [Arb Calculator](https://github.com/lukereed1/arb-calculator).

## Features

- **Multi-Sport Support**: Target specific betting markets with support for multiple sports, such as AFL and NRL.
- **Arbitrage Opportunity Identification**: Games with margins under 100% signal potential arbitrage opportunities. Users can potentially lock in profits using the arb calculator.
- **Single or Multi-Sport Scraping**: Choose to scrape data for individual sports or all supported sports at once.

## Quick Start

### 1. Clone the repository:

```bash
git clone https://github.com/lukereed1/arb-check-console.git
```

### 2. Navigate to the project directory:

```bash
cd arb-check-console
```

### 3. Install Dependencies:

```bash
npm install
```

### 4. Edit API URL Endpoint:

- Open the config.json file in your preferred text editor and update the API_URL value to point to the appropriate endpoint:

  ```json
  {
  	"API_URL": "your_api_url_here"
  }
  ```

### 5. Create an executable (Optional)

- Ensuring you're in the projects directory, type:

  ```bash
  pkg .
  ```

  Depending on your platform:

  - **Windows**: Double-click on `arb-check-console-win.exe`.

  - **MacOS**: Double-click on `arb-check-console-macos.app` or run the following in the terminal:
    ```bash
    ./arb-check-console-macos
    ```
  - **Linux**: Run the following in the terminal:
    ```bash
    ./arb-check-console-linux
    ```

### 6. Follow the on-screen prompts to select between AFL, NRL, or scraping all sports.

## How it Works

1. Users select the desired sport(s) to scrape from the menu, using the number that aligns with their choice.
2. Data is fetched from the bookmakers via the Arb Check backend. Signified by the loading dots.
3. Games are sorted by their margins.
4. Those with margins under 100% arbitrage opportunities.
5. Enter odds into [Arb Calculator](https://github.com/lukereed1/arb-calculator) to determine stake sizes.

## Example Output

![image](https://github.com/lukereed1/arb-check-console/assets/104820125/2c9e6256-0e39-4ddb-965d-2f4d06265914)

## Future Plans

- Extend support to more sports and bookmakers.
- Implement automatic alerts through AWS SES if arbitrage opportunities are present.
- Host backend on AWS EC2.
- Direct integration with the arb calculator for real-time profit calculations.
