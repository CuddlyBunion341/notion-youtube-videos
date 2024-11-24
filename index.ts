import dotenv from 'dotenv';

dotenv.config();

import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

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

    return videos.data.items.map(video => ({
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
    }));
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    return [];
  }
};

const myVideos = await getMyVideos();

console.log(myVideos);
