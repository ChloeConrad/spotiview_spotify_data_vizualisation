async function selectSubject() {
  window.global.subject = document.getElementById("subject").value

  await loadFullData()

}

async function loadFullData() {

  console.log("Start Loading Full Data")

  if(window.global.subject == "elliot") {
    window.global.fullHistory = await loadJson("datasets/tracks/light_streaming_history_elliot.json")
    

    window.global.fullHistory.forEach( d => {
      d.ts = new Date(d.ts)
    }) 
    window.global.fullArtists = d3.group(await loadJson("datasets/tracks/artists_elliot.json"), d=>d.id)
    window.global.fullAlbums  = d3.group(await loadJson("datasets/tracks/albums_elliot.json"), d=>d.id)
    window.global.fullTracks  = d3.group(await loadJson("datasets/tracks/tracks_elliot.json"), d=>d.id)
  } else if(window.global.subject == "elodie") {
    window.global.fullHistory = await loadJson("datasets/tracks/light_streaming_history_elodie.json")
    

    window.global.fullHistory.forEach( d => {
      d.ts = new Date(d.ts)
    }) 
    window.global.fullArtists = d3.group(await loadJson("datasets/tracks/artists_elodie.json"), d=>d.id)
    window.global.fullAlbums  = d3.group(await loadJson("datasets/tracks/albums_elodie.json"), d=>d.id)
    window.global.fullTracks  = d3.group(await loadJson("datasets/tracks/tracks_elodie.json"), d=>d.id)
  } else {
    console.log("Error Loading Full Data, unknown subject")
  }

  console.log("End Loading Full Data")

  console

  
}

async function loadJson(path) {
  return d3.json(path)
}