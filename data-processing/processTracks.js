import * as fs from 'fs';

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



fs.writeFileSync(TRACKS_DIR_PATH + "tracks_"+ INSTANCE +".json", JSON.stringify(tracksProcessed))
fs.writeFileSync(TRACKS_DIR_PATH + "albums_"+ INSTANCE +".json", JSON.stringify(albumsProcessed))
fs.writeFileSync(TRACKS_DIR_PATH + "artists_"+ INSTANCE +".json", JSON.stringify(artistList))