function artistsDetails() {

    // https://codepen.io/zakariachowdhury/pen/EZeGJy

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


    const totalMs = d3.sum(artistsList, (d) => d.totalTs);

    artistsList.forEach((d) => {
      d.totalTs = (d.totalTs * 100) / totalMs;
    });

    var otherArtists = artistsList.filter((a) => a.totalTs < 0.2);
    var mainArstists = artistsList.filter((a) => a.totalTs >= 0.2);

    var artistData = null;

    if (window.global.mainArtistSelected) {
      artistData = mainArstists;
    } else {
      artistData = otherArtists;
    }

    var mainArtistsProportion = d3.sum(mainArstists, (d) => d.totalTs);

    var proportions = [
      {
        title: "Top artistes",
        proportion: mainArtistsProportion,
      },
      {
        title: "Autres artistes",
        proportion: 100 - mainArtistsProportion,
      },
    ];

    
    artistData.sort(function(x, y){
      return d3.descending(x.totalTs, y.totalTs);
    })
        
    var text = "";

    var width = 400;
    var height = 400;
    var thickness = 75;

    var radius = Math.min(width, height) / 2.1;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var donutExist = d3.select("#artistDonut").size() > 0;

    if (donutExist) {
      d3.select("#artistDonut").remove();
    }

    //--------------------------------DETAIL------------------------------------------------

    var svg = d3
      .select("#detailedArtists")
      .append("svg")
      .attr("id", "artistDonut")
      .attr("class", "pie")
      .attr("width", width)
      .attr("height", height);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var arc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    var pie = d3
      .pie()
      .value(function (d) {
        return d.totalTs;
      })
      .sort(null);
    var colors = ["#3a5134","#1DB954","#000000"] 
    var path = g
      .selectAll("path")
      .data(pie(artistData))
      .enter()
      .append("g")
      .on("mouseover", function (d, data) {
        let g = d3
          .select(this)
          .style("cursor", "pointer")
          .style("fill", "black")
          .append("g")
          .attr("class", "text-group");


        g.append("text")
          .attr("class", "name-text")
          .text(`${data.data.artist.name}`)
          .attr("text-anchor", "middle")
          .attr("dy", "-1.2em");

        g.append("text")
          .attr("class", "value-text")
          .text(data.value.toFixed(2) + "%")
          .attr("text-anchor", "middle")
          .attr("dy", ".6em");
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("cursor", "none")
          .style("fill", color(this._current))
          .select(".text-group")
          .remove();
      })
      .append("path")
      .attr("class", "piePart-detailedArtist")
      .attr("d", arc)
      //.attr("fill", (d, i) => color(i))
      //.attr("fill", (d, i) => i % 2 === 0 ? "#1DB954" : "#000000")  
      .attr("fill", (d, i) => colors[i%3])
      .on("mouseover", function (d) {
        d3.selectAll(".piePart-detailedArtist").style(
          "filter",
          "contrast(40%)"
        );

        d3.select(this).style("filter", "contrast(200%)");
      })
      .on("mouseout", function (d) {
        d3.selectAll(".piePart-detailedArtist")
          .style("filter", "contrast(100%)")
          /*.style("fill", (d, i) => {
            return color(i);
          });*/
          .attr("fill", (d, i) => i % 2 === 0 ? "#1DB954" : "#000000")  
          .attr("fill", (d, i) => colors[i%3])

      })
      .each(function (d, i) {
        this._current = i;
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(text);
  }

function artistsSelector() {

    // https://codepen.io/zakariachowdhury/pen/EZeGJy

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


    const totalMs = d3.sum(artistsList, (d) => d.totalTs);

    artistsList.forEach((d) => {
      d.totalTs = (d.totalTs * 100) / totalMs;
    });

    var otherArtists = artistsList.filter((a) => a.totalTs < 0.2);
    var mainArstists = artistsList.filter((a) => a.totalTs >= 0.2);

    var mainArtistsProportion = d3.sum(mainArstists, (d) => d.totalTs);

    var proportions = [
      {
        title: "Top artistes",
        proportion: mainArtistsProportion,
      },
      {
        title: "Autres artistes",
        proportion: 100 - mainArtistsProportion,
      },
    ];

    
    artistsList.sort(function(x, y){
        return d3.descending(x.totalTs, y.totalTs);
    })
        
    var text = "";

    var width = 400;
    var height = 400;
    var thickness = 75;

    var radius = Math.min(width, height) / 2.1;
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var colors = ["1DB954","#000000"] 

    var donutSelectorExist = d3.select("#artistSelector").size() > 0;

    if (donutSelectorExist) {
      // https://d3-graph-gallery.com/graph/pie_changeData.html

      //d3.select('#artistSelector').remove()

      svg = d3.select("#artists");
      var pie = d3
        .pie()
        .value(function (d) {
          return d.proportion;
        })
        .sort(null);

      const u = svg
        .selectAll("path")
        .data(pie(proportions))
        .join("path")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .arc()
            .innerRadius(radius - thickness)
            .outerRadius(radius)
        );

      //https://stackoverflow.com/questions/51011832/d3-transition-to-count-up
      const t = d3.select("#selectorValueText");

      t.transition()
        .tween("text", () => {
          var selection = d3.select("#selectorValueText");

          var start = parseFloat(t.text().replace("%", ""));

          if (window.global.mainArtistSelected) {
            var end = proportions[0].proportion;
          } else {
            var end = proportions[1].proportion;
          }

          var interpolator = d3.interpolateNumber(start, end);


          return function (t) {
            selection.text(interpolator(t).toFixed(2) + "%");
          }; // return value
        })
        .duration(1000);
    } else {
      //--------------------------------SELECTOR------------------------------------------------
      var svg = d3
        .select("#artists")
        .append("svg")
        .attr("id", "artistSelector")
        .attr("class", "pie")
        .attr("width", width)
        .attr("height", height);

      var g = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arc = d3
        .arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

      var pie = d3
        .pie()
        .value(function (d) {
          return d.proportion;
        })
        .sort(null);

      var path = g
        .selectAll("path")
        .data(pie(proportions))
        .enter()
        .append("g")
        .attr("id", (d) => {
          if (d.data.title === "Top artistes") {
            return "selectorMainArtistsG";
          }
          return "selectorOtherArtistsG";
        })
        .on("click", function (d, data) {
          d3.selectAll(".textMainOthers").remove();

          let g = d3
            .select(this)
            .style("cursor", "pointer")
            .append("g")
            .attr("class", "text-group");

          g.append("text")
            .attr("class", "name-text textMainOthers")
            .text(`${data.data.title}`)
            .attr("text-anchor", "middle")
            .attr("dy", "-1.2em");

          g.append("text")
            .attr("class", "value-text textMainOthers")
            .attr("id", "selectorValueText")
            .text(data.data.proportion.toFixed(2) + "%")
            .attr("text-anchor", "middle")
            .attr("dy", ".6em");
        })
        .append("path")
        .attr("class", "piePart")
        .attr("d", arc)
        
        .attr("fill", (d, i) => i % 2 === 0 ? "#1DB954" : "#000000")  

        .attr("id", (d) => {
          if (d.data.title === "Top artistes") {
            return "selectorMainArtistsPath";
          }
          return "selectorOtherArtistsPath";
        })
        .on("click", function (d, data) {

          d3.selectAll(".piePart").attr("fill","#000000")
          d3.select(this).attr("fill","#1DB954")

          if (data.data.title === "Top artistes") {
            window.global.mainArtistSelected = true;
          } else {
            window.global.mainArtistSelected = false;
          }

          artistsDetails();
        })
        .each(function (d, i) {
          this._current = i;
        });


      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(text);


      //document.getElementById("cc").click();

      //document.getElementById("selectorMainArtistsPath").click();
    }
  }