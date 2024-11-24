import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export const checkDatabaseAttributes = async () => {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  let updated = false;

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

  // Ensure "UploadedAt" property exists
  if (!response.properties.UploadedAt || response.properties.UploadedAt.type !== 'date') {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        UploadedAt: {
          date: {}
        }
      }
    });
    console.info('Database updated: Added "UploadedAt" property of type "date".');
    updated = true;
  }

  if (!updated) {
    console.info('Database schema is already up to date.');
  }
};

export const videoExists = async (videoId) => {
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

export const createNotionRecord = async (video) => {
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
      UploadedAt: {
        date: {
          start: video.uploadedAt,
        },
      },
    },
  });

  console.info(`Video with ID ${video.id} added to the database.`);
};
