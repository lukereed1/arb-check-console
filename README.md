# Arb Check Console Application

Arb Check Console Application is a CLI tool designed to fetch sports betting data from various bookmakers using the Arb Check backend. It identifies arbitrage opportunities by sorting games based on their margins. It's designed to be used with the [Arb Calculator](https://github.com/lukereed1/arb-calculator).

(Not finished, still adding sports)

## What is Arbitrage?

Betting/sports arbitrage is an example of arbitrage arising on betting markets due to either bookmakers' differing opinions on event outcomes or errors. When conditions allow, by placing one bet per each outcome with different betting companies, the bettor can make a profit regardless of the outcome.

## Features

- **Multi-Sport Support**: Target specific betting markets with support for multiple sports, such as AFL and NRL.
- **Arbitrage Opportunity Identification**: Games with margins under 100% signal potential arbitrage opportunities. Users can potentially lock in profits using the arb calculator.
- **Single or Multi-Sport Scraping**: Choose to scrape data for individual sports or all supported sports at once.

## Supported bookies

- Sportsbet
- Neds
- Pointsbet
- Tab
- Unibet
- Palmerbet
- TopSport
- Boombet
- BetDeluxe

## Supported Sports

- Rugby League

  - NRL

- Aussie Rules

  - AFL

- Baseball

  - MLB

- Soccer
  - EPL

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

### 4. Edit API URL:

- Open the config.json file in your preferred text editor and enter your API_URL:

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

### 6. Follow the on-screen prompts

- Choose what you want scraped

![image](https://github.com/lukereed1/arb-check-console/assets/104820125/f4f960d7-5cce-4e0a-96f5-47ef0ad5c836)


## How it Works

1. Users select the desired sport(s) to scrape from the menu, using the number that aligns with their choice.
2. Data is fetched from the bookmakers via the Arb Check backend. Signified by the loading dots.
3. Games are sorted by their margins.
4. Those with margins under 100% are arbitrage opportunities, the lower the better.
5. Enter odds into [Arb Calculator](https://github.com/lukereed1/arb-calculator) to determine stake sizes.

## Example Output

![image](https://github.com/lukereed1/arb-check-console/assets/104820125/fd4ef8ed-a0e8-4bde-af61-17b42da15ac2)


## Future Plans

- Extend support to more sports and bookmakers.
- Implement automatic alerts through AWS SES and Eventbridge if arbitrage opportunities are present.
- Host backend on AWS EC2.
- Direct integration with the arb calculator for real-time profit calculations.
