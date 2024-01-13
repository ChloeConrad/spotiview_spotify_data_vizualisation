function artists() {
    // https://codepen.io/zakariachowdhury/pen/EZeGJy

    const groupedHistoryByTracks = d3.group(window.global.historyFiltered, d => d.trackId)

    const tracks = Array.from(groupedHistoryByTracks, ([key, values]) => ({
        trackId: key,
        totalTs: d3.sum(values, d => d.ms_played)
    }));


    var artistsList = []
    tracks.forEach(d=>{
        // Pour chaque artists présent dans la track
        if(window.global.fullTracks.get(d.trackId)) {
            window.global.fullTracks.get(d.trackId)[0].artists.forEach(a => {
                artistsList.push({
                    artist  : a,
                    totalTs : d.totalTs
                })
            })
        }
    })

    artistsList = d3.group(artistsList, d => d.artist)
    artistsList = Array.from(artistsList, ([key, values]) => {

        if(window.global.fullArtists.get(key)) {
            return {
                artist: window.global.fullArtists.get(key)[0],
                totalTs: d3.sum(values, d => d.totalTs)
            }
        }

        return {
            artist: "que dalle et jcomprend pas srx",
            totalTs: 0
        }
    });


    const totalMs = d3.sum(artistsList, d => d.totalTs)

    
    artistsList.forEach(d=>{
        d.totalTs = d.totalTs * 100 / totalMs
    })

    /*
    artists.sort(function(x, y){
        return d3.descending(x.totalTs, y.totalTs);
    })
    */
            
    var text = "";

    var width = 400;
    var height = 400;
    var thickness = 75;

    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory10);


    var donutExist = d3.select('#artistDonut').size() > 0;

    if(donutExist) {
        d3.select('#artistDonut').remove()
    }

    var svg = d3.select("#artists")
        .append('svg')
        .attr("id", "artistDonut")
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    var g = svg.append('g')
        .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

    var arc = d3.arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.totalTs; })
        .sort(null);

    var path = g.selectAll('path')
        .data(pie(artistsList))
        .enter()
        .append("g")
        .on("mouseover", function(d,data) {
            let g = d3.select(this)
                .style("cursor", "pointer")
                .style("fill", "black")
                .append("g")
                .attr("class", "text-group");


            g.append("text")
                .attr("class", "name-text")
                .text(`${data.data.artist.name}`)
                .attr('text-anchor', 'middle')
                .attr('dy', '-1.2em');
        
            g.append("text")
                .attr("class", "value-text")
                .text(`${parseFloat(data.value).toFixed(2)} %`)
                .attr('text-anchor', 'middle')
                .attr('dy', '.6em');
            })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("cursor", "none")  
                .style("fill", color(this._current))
                .select(".text-group").remove();
            })
        .append('path')
        .attr("class", "piePart")
        .attr('d', arc)
        .attr('fill', (d,i) => color(i))
        .on("mouseover", function(d) {
            d3.selectAll(".piePart")     
                .style("filter", "contrast(40%)")

            d3.select(this)
                .style("filter", "contrast(200%)")        
        })
        .on("mouseout", function(d) {
            d3.selectAll(".piePart")
                .style("filter", "contrast(100%)")
                .style('fill', (d,i) => {
                    return color(i)
                })
            })
        .each(function(d, i) { this._current = i; });

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(text);
}