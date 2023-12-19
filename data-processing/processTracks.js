import * as fs from 'fs';
import { getArtist, getSeveralArtists, getSpotifyAccessToken } from 'spotify-node-wrapper';

const TRACKS_DIR_PATH = "../datasets/tracks/"

const INSTANCE = "elliot"

const filePath = TRACKS_DIR_PATH + "raw_tracks_"+ INSTANCE +".json"

const tracks = JSON.parse(fs.readFileSync(filePath))

const redundantArtistList = tracks.map(t => t.artists).flat(1).concat(tracks.map(t => t.album.artists).flat(1))
const artistList = [...new Map(redundantArtistList.map(item => [item["id"], item])).values()];

const redundantAlbumList = tracks.map(t=>t.album)
const albumList = [...new Map(redundantAlbumList.map(item => [item["id"], item])).values()];

let tracksProcessed = tracks.map( t => {
  t.album = t.album.id;
  t.artists = t.artists.map( x => x.id)
  delete t.available_markets
  delete t.uri
  delete t.type
  return t
})

tracksProcessed = tracksProcessed.filter( t => (Object.keys(t.external_ids)).includes("isrc"))

let albumsProcessed = albumList.map( a => {
  delete a.available_markets
  a.artists = a.artists.map(x => x.id) 
  return a
})


const CLIENT_ID = "a2793b078c7b46daa1370e663d920581"
const CLIENT_SECRET = "9414c0dc83a3497e937452a371a82ab1"
const REDIRECT_URL = "https://ambroise.cloud/"

function listSplit(liste, tailleMax) {
  let result = [];
  for (let i = 0; i < liste.length; i += tailleMax) {
      result.push(liste.slice(i, i + tailleMax));
  }
  return result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const accessToken = await getSpotifyAccessToken(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

const artistiSplits = listSplit(artistList,50)

const albumFetch = []

console.log("Fetch Albums Data")
for (let i = 0; i < artistiSplits.length; i++) {
  console.log(i,"/",artistiSplits.length)
  const artistSplit = artistiSplits[i];
  albumFetch.push.apply(albumFetch, await getSeveralArtists(accessToken, artistSplit.map(x => x.id)).then(res => res.artists.flat(1)))
  sleep(500)
}

fs.writeFileSync(TRACKS_DIR_PATH + "tracks_"+ INSTANCE +".json", JSON.stringify(tracksProcessed))
fs.writeFileSync(TRACKS_DIR_PATH + "albums_"+ INSTANCE +".json", JSON.stringify(albumFetch))
fs.writeFileSync(TRACKS_DIR_PATH + "artists_"+ INSTANCE +".json", JSON.stringify(artistList))