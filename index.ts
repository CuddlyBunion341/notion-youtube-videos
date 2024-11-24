import dotenv from 'dotenv';
import { google } from 'googleapis';
import { Client } from '@notionhq/client';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const checkDatabaseAttributes = async () => {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  let updated = false;

  if (!response.properties.Name || response.properties.Name.type !== 'title') {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        Name: {
          title: {}
        }
      }
    });
    console.info('Database updated: Added "Name" property of type "title".');
    updated = true;
  }

  if (!response.properties.Description || response.properties.Description.type !== 'rich_text') {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        Description: {
          rich_text: {}
        }
      }
    });
    console.info('Database updated: Added "Description" property of type "rich_text".');
    updated = true;
  }

  if (!response.properties.URL || response.properties.URL.type !== 'url') {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        URL: {
          url: {}
        }
      }
    });
    console.info('Database updated: Added "URL" property of type "url".');
    updated = true;
  }

  if (!updated) {
    console.info('Database schema is already up to date.');
  }
};

const createNotionRecord = async (video) => {
  await notion.pages.create({
    parent: { database_id: databaseId },
    cover: {
      type: 'external',
      external: {
        url: video.thumbnail,
      },
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: video.title,
            },
          },
        ],
      },
      Description: {
        rich_text: [
          {
            text: {
              content: video.description,
            },
          },
        ],
      },
      URL: {
        url: video.url,
      },
    },
  });
};

const getChannelIdByUsername = async (username: string) => {
  try {
    const res = await youtube.search.list({
      part: 'snippet',
      q: username,
      type: 'channel'
    });

    if (!res.data.items || res.data.items.length === 0) {
      throw new Error('No channel found with the provided username.');
    }

    return res.data.items[0].id.channelId;
  } catch (error) {
    console.error('Error fetching channel ID:', error.message);
    return null;
  }
};

const getMyVideos = async () => {
  try {
    await checkDatabaseAttributes();

    const channelId = await getChannelIdByUsername(process.env.YOUTUBE_CHANNEL_NAME);

    if (!channelId) {
      throw new Error('Channel ID not found.');
    }

    const res = await youtube.channels.list({
      part: 'contentDetails',
      id: channelId
    });

    if (!res.data.items || res.data.items.length === 0) {
      throw new Error('No channel found with the provided ID.');
    }

    const playlistId = res.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videos = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId
    });

    if (!videos.data.items || videos.data.items.length === 0) {
      throw new Error('No videos found in the playlist.');
    }

    const videoDetails = videos.data.items.map(video => ({
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      thumbnail: video.snippet.thumbnails.default.url
    }));

    for (const video of videoDetails) {
      await createNotionRecord(video);
    }

    return videoDetails;
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    return [];
  }
};

// Call the function to fetch videos and create Notion records
getMyVideos();
