# notion-youtube-videos

A project to fetch YouTube videos from a specified channel and add them to a Notion database.

## Requirements

- **Bun**: Bun is a fast JavaScript runtime like Node.js. It is required to run this project. To install Bun, visit the [Bun installation page](https://bun.sh/docs/install) and follow the instructions provided.

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/CuddlyBunion341/notion-youtube-videos.git
    cd notion-youtube-videos
    ```

2. Install dependencies using Bun:

    ```sh
    bun install
    ```

## Obtaining API Keys

### Google API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to the **API & Services** section.
4. Enable the YouTube Data API v3.
5. Create credentials for the API and obtain your API key.

### Notion API Key

1. Go to the [Notion Integrations](https://www.notion.so/my-integrations) page.
2. Click on "New integration".
3. Fill in the required details and click "Submit".
4. Copy the integration token (API key) provided.

## Obtaining Notion Database ID

1. Open your Notion workspace in your browser.
2. Navigate to the page containing the database you want to use.
3. Open the database page in your browser.
4. In the URL, you will see a part that looks like this: `https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=********************************`.
5. The part before the `?v=` (`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) is your Notion Database ID. Copy this ID.

## Connecting Notion Integration to Database

1. Create the Integration
    1. Go to the [Notion Integrations](https://www.notion.so/my-integrations) page.
    2. Create a new integration by setting a workspace and a name.
    3. Ensure the integration has `Read content`, `Update content`, and `Insert content` permissions.
    4. Copy the Internal Integration Secret to your `.env` file.

2. Connect the Database to the Integration
    1. Open the Notion database you want to use.
    2. Click on the **Share** button at the top-right corner of the page.
    3. In the **Invite** section, type the name of your integration and select it.
    4. Click **Invite** to share the database with your integration.

## Database Structure

Ensure your Notion database has the following structure:

1. **Title Property**:
    - Name: `Name`
    - Type: `title`

Other properties required by the script will be automatically added:

- **Description**: `rich_text`
- **URL**: `url`
- **VideoID**: `rich_text`
- **UploadedAt**: `date`

The thumbnail of the video will be set as the record page cover.

## Setting Environment Variables

Create a `.env` file in the root directory of the project and add the required environment variables. You can refer to the `.env.example` file for the required variables.

## Running the Project

To run the project, use the following command:

```sh
bun run src/index.ts
```

## Periodically Fetching Videos

To periodically fetch videos, you can set up a cron job that runs a bash script at regular intervals.

1. Create a bash script named `fetch_videos.sh` in the root directory of the project:

    ```sh
    #!/bin/bash
    cd /path/to/your/notion-youtube-videos
    bun run src/index.ts
    ```

    Make sure to replace `/path/to/your/notion-youtube-videos` with the actual path to your project directory.

2. Make the script executable:

    ```sh
    chmod +x fetch_videos.sh
    ```

3. Open your crontab file:

    ```sh
    crontab -e
    ```

4. Add the following line to run the script every hour (adjust the schedule as needed):

    ```sh
    0 * * * * /path/to/your/notion-youtube-videos/fetch_videos.sh
    ```

    This will run the script at the beginning of every hour. Adjust the schedule as needed. You can use [crontab.guru](https://crontab.guru/) to help you with the cron schedule syntax.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
