function getFavArtists(data, nbArtists) {
    var artists =  data.map(function(value, index) {return value['master_metadata_album_artist_name']});
    var artists_count = {};

    artists.forEach(function(value, index) {
        if (value in artists_count) {
            artists_count[value] += 1;
        } else if(value != null){
            artists_count[value] = 1;
        }
    });
    artists_count = Object.entries(artists_count).map(([name, occurrences]) => ({ name, occurrences }));
    artists_count.sort((a, b) => b.occurrences - a.occurrences);
    var top_artists = artists_count.slice(0, nbArtists).map(artist => artist.name);
    return top_artists;

}


function topArtistsViz() {
    document.getElementById("firstfive").innerHTML = ""; 
    document.getElementById("lastfive").innerHTML = ""; 
    
    const groupedHistoryByTracks = d3.group(
        window.global.historyFiltered,
        (d) => d.trackId
    );

    const tracks = Array.from(groupedHistoryByTracks, ([key, values]) => ({
        trackId: key,
        totalTs: d3.sum(values, (d) => d.ms_played),
    }));

    var artistsList = [];
    tracks.forEach((d) => {
        // Pour chaque artists présent dans la track
        if (window.global.fullTracks.get(d.trackId)) {
        window.global.fullTracks.get(d.trackId)[0].artists.forEach((a) => {
            artistsList.push({
            artist: a,
            totalTs: d.totalTs,
            });
        });
        }
    });

    artistsList = d3.group(artistsList, (d) => d.artist);
    artistsList = Array.from(artistsList, ([key, values]) => {
        if (window.global.fullArtists.get(key)) {
        return {
            artist: window.global.fullArtists.get(key)[0],
            totalTs: d3.sum(values, (d) => d.totalTs),
        };
        }

        return {
        artist: "que dalle et jcomprend pas srx",
        totalTs: 0,
        };
    });

    

    artistsList.sort(function(x, y){
        return d3.descending(x.totalTs, y.totalTs);
    })

    artistsList = artistsList.slice(0,10)
    topFiveArtists = artistsList.slice(0,5)
    bottomTopFiveArtists = artistsList.slice(5,10)

    // Container for first 5 artists
    const top_svg = d3.select("#firstfive").append("svg")
        .attr("width", "100%")
        .attr("height", topFiveArtists.length * 100);

    // Add images for each artist
    top_svg.selectAll("image")
        .data(topFiveArtists)
        .enter().append("image")
        .attr("xlink:href", d => d.artist.images[2].url)
        .attr("width", 80)
        .attr("height", 80)
        .attr("x", 50)
        .attr("y", (d, i) => i * 100 + 10);



    var top_texts = top_svg.selectAll("text")
        .data(topFiveArtists)
        .enter();

        top_texts.append("text")
        .text((d) => d.artist.name)
        .attr("x", 150)
        .attr("y", function(_, i) {
            return i * 100 + 40;
        })
        .attr("font-weight", 600)
        .style("fill", "#1DB954");

        top_texts.append("text")
        .text((d, i) => i + 1)
        .attr("x", 30)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        })
        .attr("font-weight", 600)
        .style("fill", "#1DB954");

        top_texts.append("text")
        .text((d) => d.artist.genres[0])
        .attr("x", 150)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        });

        top_texts.append("text")
        .text((d) => "Temps d'écoute : "+(d.totalTs / 3600000).toFixed(2)+"h")
        .attr("x", 350)
        .attr("y", function(_, i) {
            return i * 100 + 40;
        });

        top_texts.append("text")
        .text((d) => "Followers : "+d.artist.followers.total)
        .attr("x", 350)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        });

    const bottom_svg = d3.select("#lastfive").append("svg")
        .attr("width", "100%")
        .attr("height", bottomTopFiveArtists.length * 100);

    // Add images for each artist
    bottom_svg.selectAll("image")
        .data(bottomTopFiveArtists)
        .enter().append("image")
        .attr("xlink:href", d => d.artist.images[2].url)
        .attr("width", 80)
        .attr("height", 80)
        .attr("x", 50)
        .attr("y", (d, i) => i * 100 + 10);



    var bottom_texts = bottom_svg.selectAll("text")
        .data(bottomTopFiveArtists)
        .enter();

        bottom_texts.append("text")
        .text((d) => d.artist.name)
        .attr("x", 150)
        .attr("y", function(_, i) {
            return i * 100 + 40;
        })
        .attr("font-weight", 600)
        .style("fill", "#1DB954");

        bottom_texts.append("text")
        .text((d, i) => i + 6)
        .attr("x", 30)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        })
        .attr("font-weight", 600)
        .style("fill", "#1DB954");

        bottom_texts.append("text")
        .text((d) => d.artist.genres[0])
        .attr("x", 150)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        });

        bottom_texts.append("text")
        .text((d) => "Temps d'écoute : "+(d.totalTs / 3600000).toFixed(2)+"h")
        .attr("x", 350)
        .attr("y", function(_, i) {
            return i * 100 + 40;
        });

        bottom_texts.append("text")
        .text((d) => "Followers : "+d.artist.followers.total)
        .attr("x", 350)
        .attr("y", function(_, i) {
            return i * 100 + 60;
        });
}