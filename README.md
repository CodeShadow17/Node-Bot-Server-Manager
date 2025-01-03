# Node Bot Server Manager

This Bot Manager script provides a command-line interface (CLI) to manage multiple bot processes. It allows you to start, stop, restart, monitor, and perform various other operations on bots located in the BOTS directory.

## Note:
This code only supports node.js codes that rely on the package.json file.
The code will automatically create all folders if you run it as a test without doing anything.

## Features:

- **Start/Stop/Restart Bots**: Manage individual or all bots at once.
- **Monitor Bots**: Automatically restart bots if they stop unexpectedly.
- **Log Management**: View logs for individual bots.
- **Backup**: Create backups of bots.
- **Update Bots**: Update and restart bots with ease.
- **Status and Info**: Check bot statuses and view detailed bot information.

## Directory Structure

- `BOTS/`: Directory containing individual bot folders. Each bot folder should include a `package.json` file with an optional `main` field specifying the entry point.
- `logs/`: Directory for log files generated by the bots.
- `backups/`: Directory where backups of bots are stored.

## Installation:

1. Clone this repository or copy the script.
2. Ensure Node.js is installed on your system. [Node.js](https://nodejs.org/en/download)
3. Place your bots in the `BOTS` directory. Each bot should have a unique folder. No need to make changes to their code, just drag their folder on the `BOTS` directory
4. Install required dependencies:
   ```bash
   npm install chokidar fs-extra path readline
   ```

## Usage

Run the script using:

```bash
node server.js
```

You can then use the CLI to manage your bots.

## Commands

- `start <botName|all>`: Start a specific bot or all bots.
- `stop <botName|all>`: Stop a specific bot or all bots.
- `restart <botName|all>`: Restart a specific bot or all bots.
- `update <botName|all>`: Update and restart a specific bot or all bots.
- `status`: Display the status of all bots.
- `logs <botName>`: View logs for a specific bot.
- `ping`: Check if the server is running and list bot statuses.
- `info <botName>`: Display detailed information about a specific bot.
- `backup <botName>`: Create a backup of a specific bot.
- `monitor <botName>`: Monitor a specific bot and restart it if it stops unexpectedly.
- `help`: Display a list of available commands.

## Example:

```bash
> start bot1
Starting bot1...
> logs bot1
[2025-01-01T12:00:00.000Z] Bot1 started.
> stop bot1
Stopping bot1...
```

## Implementation Details:

- **Bots Directory**: All bot folders are located in the `BOTS/` directory. The script automatically detects new bot folders.
- **Log Management**: Logs for each bot are saved in the `logs/` directory with filenames corresponding to the bot names.
- **Error Handling**: Bots are monitored for unexpected stops, and they are restarted automatically if needed.
- **Backup**: All backups are made in the `backups/` directory with their corresponding filenames and date of backup.

## Requirements

- Node.js [Node.js](https://nodejs.org/en/download)
- A valid `package.json` file for each bot, with an optional `main` field to specify the entry point (default is `index.js`).
- Required packages:
  ```bash
  npm install chokidar fs-extra path readline f
  ```

## Contributing

Feel free to fork the repository and submit pull requests to improve the functionality or fix issues.

## License

This project is open-source and available under the MIT License.

