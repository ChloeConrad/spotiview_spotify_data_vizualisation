import * as fs from 'fs';
import { getArtist, getSeveralArtists, getSpotifyAccessToken } from 'spotify-node-wrapper';

const TRACKS_DIR_PATH = "../datasets/tracks/"

const INSTANCE = "elliot"

const filePath = TRACKS_DIR_PATH + "streaming_history_"+ INSTANCE +".json"

const history = JSON.parse(fs.readFileSync(filePath)).filter((d) => d.spotify_track_uri !== null)

const lighterHistory = history.map(d => {
  return {
    ts: d.ts,
    ms_played: d.ms_played,
    trackId: d.spotify_track_uri.split(":")[2]
  }
})

fs.writeFileSync(TRACKS_DIR_PATH + "light_streaming_history_"+ INSTANCE +".json", JSON.stringify(lighterHistory))
