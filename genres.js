function filterMostListen(dicoGenres,seuil) {
    var valuesArray = Object.values(dicoGenres);
    valuesArray.sort((a, b) => b - a);
    var val_seuil = valuesArray[Math.floor(valuesArray.length * seuil)];
    var filteredDicoGenre = Object.fromEntries(
        Object.entries(dicoGenres).filter(([key, value]) => value >= val_seuil)
    );
    return filteredDicoGenre;
}

function getGenres(artists) {
    var sommesParGenre = {};

    for(var x in artists){
        if(artists[x].artist !== "que dalle et jcomprend pas srx") {
            artists[x].artist.genres.forEach( g => {
                if (sommesParGenre.hasOwnProperty(g) ) {
                    sommesParGenre[g] += artists[x].totalTs;
                } else {
                    sommesParGenre[g] = artists[x].totalTs;
                }
            })
        }
    }   
    return sommesParGenre
}

function getTopArtistsByGenre(genre,artists) {
    var artistsByGenre = {};
    for (var artiste in artists) {
        if(artists[artiste].artist !== "que dalle et jcomprend pas srx"){
            if (artists.hasOwnProperty(artiste) && artists[artiste].artist.genres.includes(genre)) {
                artistsByGenre[artiste]=artists[artiste];
            }
        }
    }


    var keys = Object.keys(artistsByGenre);

    // Trier les clés en fonction des occurrences (du plus grand au plus petit)
    var sortedKeys = keys.sort(function(a, b) {
        return artistsByGenre[b].occurence - artistsByGenre[a].occurence;
    });

    // Sélectionner les trois premières clés
    var topThreeArtists = sortedKeys.slice(0, 3);
    return topThreeArtists;
}

function genresViz() {
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

    artistsList = Object.fromEntries(artistsList.map(x => [x.artist.name, x]));

    var dataGenres = getGenres(artistsList)

    var filteredGenres = filterMostListen(dataGenres,0.25)
    plotHist(filteredGenres,"genres",artistsList); 

}

function plotHist(dataGenres,divName,artists){
    const MARGIN_LEFT = 30

    document.getElementById(divName).innerHTML = "";
    const w = Object.keys(dataGenres).length*7+MARGIN_LEFT;
    const h = 250;
    const yScale = d3.scaleLog()
            .domain([d3.min(Object.entries(dataGenres), d => +d[1]), d3.max(Object.entries(dataGenres), d => +d[1])])
            .range([h/10, h]);
    
    const axeScaleUp = d3.scaleLog()
            .domain([d3.min(Object.entries(dataGenres), d => +d[1])/3600000, d3.max(Object.entries(dataGenres), d => +d[1])/3600000])
            .range([h, h/2]);

    const axeScaleDown = d3.scaleLog()
            .domain([d3.min(Object.entries(dataGenres), d => +d[1])/3600000, d3.max(Object.entries(dataGenres), d => +d[1])/3600000])
            .range([h/2, h]);

    const barWidth = 6
    const barSpacing = 1
    const svg = d3.select("#"+divName)
              .append("svg")
              .attr("width", w)
              .attr("height", h);

    const bars = svg.selectAll("rect")
            .data(Object.entries(dataGenres))
            .enter()
            .append("g");

    bars.append("rect")
            .attr("x", (d, i) => i * (barWidth + barSpacing*2)+MARGIN_LEFT)
            .attr("y", (d, i) => (h -  yScale(d[1]))/2)
            .attr("width", barWidth)
            .attr("height", (d, i) => (yScale(d[1])))
            .attr("fill", (d, i) => i % 2 === 0 ? "#1DB954" : "#000000")  
            .attr("class", "bar elemHistGenre");

    d3.selectAll(".elemHistGenre")
            .on('mouseover', function (d, i) {
                var topArtists = getTopArtistsByGenre(i[0],artists)
                var maDiv = document.getElementById("genres-details");
                maDiv.innerHTML = "<strong> Genre : </strong> <br>" + i[0];
                maDiv.innerHTML += "<br><br> <strong> Heure d'écoutes : </strong> <br>" + parseInt(i[1] / 3600000)+"h"
                maDiv.innerHTML += "<br><br> <strong> Top 3 artistes : </strong><ul>";
                d3.selectAll(".elemHistGenre").style("filter", "contrast(30%)");
                d3.select(this).style("filter", "contrast(120%)");
                topArtists.forEach(element => {
                    if (element !== undefined) {
                        maDiv.innerHTML += "<li>" + element+"</li>";
                    }
                });
                maDiv.innerHTML += '</ul>'
            })
            .on('mouseout', function (d,i) {
                var maDiv = document.getElementById("genres-details");
                maDiv.innerHTML = "";
                d3.selectAll(".elemHistGenre").style("filter", "contrast(100%)");
            });   

    const axisYUp = d3.axisLeft().scale(axeScaleUp)
    // créer un nouveau groupe et y attacher l'axe
    svg.append('g')
    .attr('transform', `translate(${MARGIN_LEFT - 3} -125)`)
    .call(axisYUp)

    const axisYDown = d3.axisLeft().scale(axeScaleDown)
    // créer un nouveau groupe et y attacher l'axe
    svg.append('g')
    .attr('transform', `translate(${MARGIN_LEFT - 3})`)
    .call(axisYDown)
         
}