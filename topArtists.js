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
    d3.json('datasets/tracks/streaming_history_'+document.getElementById("subject").value+'.json').then(function(listening_history){
        d3.json('datasets/tracks/clean_artists_'+document.getElementById("subject").value+'.json').then(function(artists){
        var topTenArtists = getFavArtists(listening_history, 10);
        var topTenInfo = Object.fromEntries(
            Object.entries(artists)
                .filter(([key]) => topTenArtists.includes(key))
        );
        topTenInfo = Object.fromEntries(
          topTenArtists.map(artist => [artist, topTenInfo[artist]])
        );
        topTenInfo = Object.fromEntries(
        topTenArtists.map(artist => {
            const info = topTenInfo[artist];
            return [artist, { ...info, rank: topTenArtists.indexOf(artist) + 1 }];
            })
        );
        

        var topFiveArtists = Object.fromEntries(
            Object.entries(topTenInfo)
            .filter(([_, info]) => info.rank <= 5)
        );

        var bottomFiveArtists = Object.fromEntries(
            Object.entries(topTenInfo)
            .filter(([_, info]) => info.rank > 5)
        );
        const firstFiveNames = Object.keys(topFiveArtists);
        const lastFiveNames = Object.keys(bottomFiveArtists);
        // Container for first 5 artists
        const top_svg = d3.select("#firstfive").append("svg")
            .attr("width", "100%")
            .attr("height", firstFiveNames.length * 100);

        // Add images for each artist
        top_svg.selectAll("image")
            .data(firstFiveNames)
            .enter().append("image")
            .attr("xlink:href", d => topFiveArtists[d].images[0].url)
            .attr("width", 80)
            .attr("height", 80)
            .attr("x", 50)
            .attr("y", (d, i) => i * 100 + 10);



        var top_texts = top_svg.selectAll("text")
            .data(firstFiveNames)
            .enter();

            top_texts.append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", 150)
            .attr("y", function(_, i) {
                return i * 100 + 40;
            })
            .attr("font-weight", 600)
            .style("fill", "#1DB954");

            top_texts.append("text")
            .text(function(d) {
                return topFiveArtists[d].rank;
            })
            .attr("x", 30)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            })
            .attr("font-weight", 600)
            .style("fill", "#1DB954");

            top_texts.append("text")
            .text(function(d) {
                return "Genre : "+ topFiveArtists[d].genre;
            })
            .attr("x", 150)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            });

            top_texts.append("text")
            .text(function(d) {
                return "Nombre d'écoutes : "+topFiveArtists[d].occurence;
            })
            .attr("x", 350)
            .attr("y", function(_, i) {
                return i * 100 + 40;
            });

            top_texts.append("text")
            .text(function(d) {
                return "Followers : "+topFiveArtists[d].followers;
            })
            .attr("x", 350)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            });

        const bottom_svg = d3.select("#lastfive").append("svg")
            .attr("width", "100%")
            .attr("height", lastFiveNames.length * 100);

        // Add images for each artist
        bottom_svg.selectAll("image")
            .data(lastFiveNames)
            .enter().append("image")
            .attr("xlink:href", d => bottomFiveArtists[d].images[0].url)
            .attr("width", 80)
            .attr("height", 80)
            .attr("x", 50)
            .attr("y", (d, i) => i * 100 + 10);



        var bottom_texts = bottom_svg.selectAll("text")
            .data(lastFiveNames)
            .enter();

            bottom_texts.append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", 150)
            .attr("y", function(_, i) {
                return i * 100 + 40;
            })
            .attr("font-weight", 600)
            .style("fill", "#1DB954");

            bottom_texts.append("text")
            .text(function(d) {
                return bottomFiveArtists[d].rank;
            })
            .attr("x", 30)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            })
            .attr("font-weight", 600)
            .style("fill", "#1DB954");

            bottom_texts.append("text")
            .text(function(d) {
                return "Genre : "+ bottomFiveArtists[d].genre;
            })
            .attr("x", 150)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            });

            bottom_texts.append("text")
            .text(function(d) {
                return "Nombre d'écoutes : "+bottomFiveArtists[d].occurence;
            })
            .attr("x", 350)
            .attr("y", function(_, i) {
                return i * 100 + 40;
            });

            bottom_texts.append("text")
            .text(function(d) {
                return "Followers : "+bottomFiveArtists[d].followers;
            })
            .attr("x", 350)
            .attr("y", function(_, i) {
                return i * 100 + 60;
            });
    });
});
}