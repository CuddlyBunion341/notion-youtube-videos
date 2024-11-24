import dotenv from 'dotenv';
import { checkDatabaseAttributes, createNotionRecord } from './services/notionService';
import { getMyVideos } from './services/youtubeService';

dotenv.config();

const main = async () => {
  await checkDatabaseAttributes();
  const videos = await getMyVideos();
  for (const video of videos) {
    await createNotionRecord(video);
  }
};

main();
