# notion-youtube-videos

A project to fetch YouTube videos from a specified channel and add them to a Notion database.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/notion-youtube-videos.git
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
2. Create a new integration.
3. Obtain the integration token (API key).

## Setting Environment Variables

Create a `.env` file in the root directory of the project and add the required environment variables. You can refer to the `.env.example` file for the required variables.

## Running the Project

To run the project, use the following command:

```sh
bun run src/index.ts
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
