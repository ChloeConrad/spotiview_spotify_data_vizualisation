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
    for (var artiste in artists) {
        var genre = artists[artiste].genre;
        if ("occurence" in artists[artiste]) {
            var count = artists[artiste]["occurence"]
            if (sommesParGenre.hasOwnProperty(genre) ) {
                sommesParGenre[genre] += count;
            } else {
                sommesParGenre[genre] = count;
            }
        }
    }
    return sommesParGenre
}

function getTopArtistsByGenre(genre,artists) {
    var artistsByGenre = {};
    for (var artiste in artists) {
        if (artists.hasOwnProperty(artiste) && artists[artiste].genre === genre) {
            artistsByGenre[artiste]=artists[artiste];
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
    d3.json("datasets/tracks/clean_artists_"+document.getElementById("subject").value+".json").then(function (artists) {

        var dataGenres = getGenres(artists)
        var filteredGenres = filterMostListen(dataGenres,0.5)
        plotHist(filteredGenres,"genres",artists);
    })
}

function plotHist(dataGenres,divName,artists){
    document.getElementById(divName).innerHTML = "";
    const w = Object.keys(dataGenres).length*6;
    const h = 250;
    const yScale = d3.scaleLog()
            .domain([1, d3.max(Object.entries(dataGenres), d => +d[1])])
            .range([0, h]);

    const barWidth = 5
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
            
            .attr("x", (d, i) => i * (barWidth + barSpacing))
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
                maDiv.innerHTML += "<br><br> <strong> Nombre d'écoutes : </strong> <br>" + i[1];
                maDiv.innerHTML += "<br><br> <strong> Top 3 artistes : </strong><ul>";

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
                
  });          
}