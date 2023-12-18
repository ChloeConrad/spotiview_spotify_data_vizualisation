import { getSpotifyAccessToken, getSeveralTracks } from 'spotify-node-wrapper';
import * as fs from 'fs';








const DIR = "elliot"









const CLIENT_ID = "a2793b078c7b46daa1370e663d920581"
const CLIENT_SECRET = "9414c0dc83a3497e937452a371a82ab1"
const REDIRECT_URL = "https://ambroise.cloud/"
const DIR_PATH = "../datasets/raw/"+DIR
const TRACKS_DIR_PATH = "../datasets/tracks"


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function listSplit(liste, tailleMax) {
  let result = [];
  for (let i = 0; i < liste.length; i += tailleMax) {
      result.push(liste.slice(i, i + tailleMax));
  }
  return result;
}



const fileNames = fs.readdirSync(DIR_PATH).filter(x=>x.includes(".json"))

const musicHistory = (await Promise.all(fileNames.map((name) => JSON.parse(fs.readFileSync(DIR_PATH+"/"+name))))).flat(1).filter(x => x.spotify_track_uri !== null)

const tracksIdsSubLists = listSplit([... new Set(musicHistory.map(x => x.spotify_track_uri.split(":")[2]))], 50)






const tracks = []

const accessToken = await getSpotifyAccessToken(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

console.log("Start fetching")

for (const [i, trackIds] of tracksIdsSubLists.entries()) {
  console.log(i, "/", tracksIdsSubLists.length);
  await getSeveralTracks(accessToken, trackIds).then(data => {
    tracks.push.apply(tracks, data.tracks)
  });
  await sleep(1000);
  break;
}

console.log(tracks[0])

//fs.writeFileSync(TRACKS_DIR_PATH+"/raw_tracks_"+DIR+".json", JSON.stringify(tracks))