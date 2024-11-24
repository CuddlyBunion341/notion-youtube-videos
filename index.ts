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

  // Check if there is any property of type "title" and rename it to "Name"
  for (const [key, value] of Object.entries(response.properties)) {
    if (value.type === 'title' && key !== 'Name') {
      await notion.databases.update({
        database_id: databaseId,
        properties: {
          [key]: undefined,
          Name: {
            title: {}
          }
        }
      });
      console.info(`Database updated: Renamed "${key}" property to "Name".`);
      updated = true;
      break;
    }
  }

  // Ensure "Name" property exists
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

  // Ensure "Description" property exists
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

  // Ensure "URL" property exists
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

  // Ensure "VideoID" property exists
  if (!response.properties.VideoID || response.properties.VideoID.type !== 'rich_text') {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        VideoID: {
          rich_text: {}
        }
      }
    });
    console.info('Database updated: Added "VideoID" property of type "rich_text".');
    updated = true;
  }

  if (!updated) {
    console.info('Database schema is already up to date.');
  }
};

// Function to check if a video with the given ID already exists
const videoExists = async (videoId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'VideoID',
      rich_text: {
        equals: videoId
      }
    }
  });
  return response.results.length > 0;
};

// Updated createNotionRecord function
const createNotionRecord = async (video) => {
  const exists = await videoExists(video.id);
  if (exists) {
    console.info(`Video with ID ${video.id} already exists in the database.`);
    return;
  }

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
      VideoID: {
        rich_text: [
          {
            text: {
              content: video.id,
            },
          },
        ],
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
      id: video.snippet.resourceId.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      thumbnail: video.snippet.thumbnails.high.url // Use high resolution thumbnail
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
