import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const updateProperty = async (property, type) => {
  await notion.databases.update({
    database_id: databaseId,
    properties: {
      [property]: {
        [type]: {}
      }
    }
  });
  console.info(`Database updated: Added "${property}" property of type "${type}".`);
};

export const checkDatabaseAttributes = async () => {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  let updated = false;

  if (!response.properties.Name || response.properties.Name.type !== 'title') {
    throw new Error('Database schema error: "Name" property of type "title" is required.');
  }

  const propertiesToCheck = {
    Description: 'rich_text',
    URL: 'url',
    VideoID: 'rich_text',
    UploadedAt: 'date'
  };

  for (const [property, type] of Object.entries(propertiesToCheck)) {
    if (!response.properties[property] || response.properties[property].type !== type) {
      await updateProperty(property, type);
      updated = true;
    }
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
