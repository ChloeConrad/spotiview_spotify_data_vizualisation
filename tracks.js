function tracks() {
    document.getElementById("trackLegend").innerHTML = "";
    var h = window.global.historyFiltered

    const format = d3.utcFormat("%d-%m-%Y");
    const parseTime = d3.utcParse("%d-%m-%Y");

    h.forEach(d => {
      d.ts = parseTime(format(d.ts))
    });

    h = d3.group(h, d => d.trackId, d => d.ts)

    var dateRange = d3.timeDays(window.global.startTimestampFilter, window.global.endTimestampFilter)
    dateRange = dateRange.map( d => parseTime(format(d)))

    var tmp = []
    // Pour chaque track
    h.forEach((value, key) => {
      var s = []
      dateRange.forEach((date) => {
        if(value.has(date)) {
          s.push(value.get(date))
        }else {
          s.push([])
        }
      })
      tmp.push({
        trackId: key,
        series: s,
        mean: null
      })
    })

    h = tmp

    h.forEach( (t) => {
      t.series = t.series.map( s => {
        if(s.length === 0){
          return 0
        } else {
          return d3.sum(s, s=>s.ms_played)
        }
      })
    })

    var interval = 29
    var intervalTruc = interval - (interval-1)/2 
    
    dateRange = dateRange.slice(intervalTruc-1, dateRange.length-intervalTruc+2)

    h.map( x => {
      x.mean = d3.mean(x.series)
      x.series = movingAverage(x.series, interval).map(x => x/3600)
    })


    var sortedH = [...h].sort(function(x, y){
      return d3.descending(x.mean, y.mean);
    })

    sortedH = sortedH.slice(0,50).map(d => d.trackId)
    

    h = h.filter( x => sortedH.includes(x.trackId))


    var data = {
      tracks: h.map(x => x.trackId),
      series: h.map(x => {
        return {
          values: x.series,
          trackId: x.trackId,
          mean: x.mean
        }
      }),
      dates: dateRange
    }


    window.global.tracksData = data


    // https://observablehq.com/@mguiv/construire-un-graphique-pas-a-pas-avec-d3-js

    var height = 500
    var width = 800

    var margin = ({top: 20, right: 20, bottom: 30, left: 30})

    window.global.tracksX = d3.scaleUtc()
      .domain(d3.extent(dateRange))
      .range([margin.left, width - margin.right])

    window.global.tracksY = d3.scaleLinear()
      .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
      .range([height - margin.bottom, margin.top])

    var line = d3.line() // trace une ligne
            .defined(d => !isNaN(d)) // on supprime les valeurs manquantes
            .x((d, i) => window.global.tracksX(data.dates[i])) // renvoie la date à l'instant i
            .y(d => window.global.tracksY(d)) // renvoie les taux de chômages

    var xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`) // on déplace l'axe en bas du graphe
      .call(d3.axisBottom(window.global.tracksX).ticks(width / 40).tickSizeOuter(0)) // ticks permet de spécifier le nombre de graduation 
                                                       //tickSizeOuter(0) supprime les bordures verticales sur l'axe


    var yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`) // on déplace l'axe à gauche
      .call(d3.axisLeft(window.global.tracksY)) // axe de gauche avec les valeurs de y()
      //.call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone() // on définit le type de texte à afficher, le style...
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(() => {
            return "Temps d'écoute moyen (moyenne glissante) en minutes"
          }))

    d3.select("#tracksSvg").remove()

    const svg = d3.select("#songs-details")
                  .append("svg")
                  .attr("id", "tracksSvg")
                  .attr("viewBox", [0, 0, 800, 500]) // dimensions
                  .style("overflow", "visible");

    svg.append("g")
      .call(xAxis);
    svg.append("g")
      .call(yAxis);

    console.log("data", data)

    window.global.trackColorScale = d3.scaleSequential().domain([d3.max(data.series, x => x.mean),d3.min(data.series, x => x.mean)])
      .interpolator(d3.interpolateRgb(d3.rgb(29, 185, 84), d3.rgb(199, 243,215)));
    

    const path = svg.append("g")
                    .attr("fill", "none") // on laisse l'arrière-plan vide
                    .attr("stroke-width", 1.5)  // taille de la ligne
                    .attr("stroke-linecap", "round") //type de ligne
                    .selectAll("path")
                    .data(data.series)
                    .join("path")
                    .attr ('stroke', d=>window.global.trackColorScale(d.mean))
                    .style("mix-blend-mode", "multiply") // option de style
                    .attr("d", d => line(d.values)); // trace la valeur du taux de chômage (values) associée à un lieu (y) à la date i (x)

    svg.call(hoverTracks, path); // on passe path en argument pour la fonction hover

    const legendSvg = d3.select("#trackLegend").append("svg")
        .attr("width", 600)
        .attr("height", 50);
    var dif = window.global.trackColorScale.domain()[1] - window.global.trackColorScale.domain()[0];
      var intervals = d3.range(20).map(function(d,i) {
          return dif * i / 20 + window.global.trackColorScale.domain()[0]
      }) 
      intervals.push(window.global.trackColorScale.domain()[1]);
      intervals.sort((a,b) => a-b)

    //Append a defs (for definition) element to your SVG
    var defs = legendSvg.append("defs")

    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    //Horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    //Set the color + round interval
    intervals.forEach(function(d, i) {
      linearGradient.append("stop")
        .attr("offset", (i / (intervals.length - 1)) * 100 + "%")
        .attr("stop-color", window.global.trackColorScale(d));
    })

    intervals = intervals.map(function(element) {
      return Math.round(element * 100) / 100;
    });
    var legend = [intervals[0], intervals[Math.floor(intervals.length / 2)], intervals[intervals.length-1]]
    var legendWidth = 500;
    var legendHeight = 30;
    //Draw the rectangle and fill with gradient
    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    legendSvg.selectAll("text")
    .data(legend)
    .enter()
    .append("text")
    .text(function(d) {
      return d;
    })
    .attr("x", function(d, i) {
      return i * (legendWidth/2);
    })
    .attr("y", function(d) {
      return legendHeight + 15;
    });
  }


  function hoverTracks(svg, path) {
  
    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
    else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left);

    const dot = svg.append("g")// construction d'un conteneur
        .attr("display", "none");
    
    // création du panneau qui s'affichera au-dessus des courbes
    dot.append("polyline") // construction du panneau vide --> on utilise polyline plutôt que de fusionner un rectangle et un triangle
        .attr("points","0,0 0,144 432,144, 432,0 0,0") // dimensions du panneau
        .attr("id", "polyLineTracks")
        .style("fill", "#fafafa")
        .style("stroke"," #5dade2 ")
        .style("opacity","0.8") // légère transparence
        .style("stroke-width","1")
        .attr("transform", "translate(-215, -170)"); // translation du panneau

    // création du cercle noir sous le panneau qui indique le point précis où l'on se situe
    dot.append("circle")
        .attr("r", 6.5);

    // texte pour les noms de lieux
    dot.append("text")
        .attr("font-weight", "bold")
        .attr("font-size", 18)
        .attr("text-anchor", "middle")
        .attr("id", "dot-name") //  on donne un identifiant à ce texte
        .attr("dx", "0")
        .attr("dy", "-130")
        .attr("class", "trackText")
    
    // création d'une puce (rond bleu dans le panneau)      
    dot.append("text")
        .attr("font-size", 20)
        .style("fill", "#1DB954")
        .attr("dx", "-200")
        .attr("dy", "-90")
        .attr("class", "trackText")
        .text("●");
    
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("dx", "-180")
        .attr("dy", "-90")
        .attr("class", "trackText")
        .attr("id", "dot-date"); 

    dot.append("text")
        .attr("font-size", 20)
        .style("fill", "#1DB954")
        .attr("dx", "-200")
        .attr("dy", "-50")
        .attr("class", "trackText")
        .text("●");
    
    dot.append("text")
          .attr("font-size", 16)
          .attr("dx", "-180")
          .attr("dy", "-50")
          .attr("class", "trackText")
          .attr("id", "dot-values") 


    dot.append("text")
        .attr("font-size", 20)
        .style("fill", "#1DB954")
        .attr("dx", "20")
        .attr("dy", "-90")
        .attr("class", "trackText")
        .text("●");
    
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("dx", "40")
        .attr("dy", "-90")
        .attr("class", "trackText")
        .attr("id", "dot-datee"); 

    dot.append("text")
        .attr("font-size", 20)
        .style("fill", "#1DB954")
        .attr("dx", "20")
        .attr("dy", "-50")
        .attr("class", "trackText")
        .text("●");
    
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("dx", "40")
        .attr("dy", "-50")
        .attr("class", "trackText")
        .attr("id", "dot-listen");

    function timeToString(time) {
      if(time>60){
        return Math.floor(time/60).toString() + " heure(s) " + Math.floor(time%60).toString() + " minutes";

      }
      return parseInt(time).toString()+" minutes";
    }
  // associe l'affichage du panneau et la transparence des courbes non sélectionnées aux actions de la souris    
    function moved(event) {
      event.preventDefault(); // change les valeurs par défaut affectées aux actions (clics, mouvement de la souris...)
      const pointer = d3.pointer(event, this); // on construit un pointeur (tableau des coordonnées pour l'évènement this)


      const xm = window.global.tracksX.invert(pointer[0]); // retourne le range associé à la coordonnée en x
      const ym = window.global.tracksY.invert(pointer[1]); // retourne le range associé à la coordonné en y
      const i = d3.bisectCenter(window.global.tracksData.dates, xm); // index de la valeur de la date la plus proche de xm
      const s = d3.least(window.global.tracksData.series.slice(0,201), d => Math.abs(d.values[i] - ym)); // retourne les taux de chômage tels que la distance entre ym et ces taux à la date xm soit minimale
      const dateFormat = d3.timeFormat("%d/%m/%Y"); // on change le format des dates pour un plus joli affichage
      path.attr("stroke", d => {
          return d === s ? window.global.trackColorScale(s.mean) : "#ddd"
        })
        .filter(d => d === s).raise(); // trace une ligne avec les valeurs précédentes, raise() sert à faire passer cette ligne au premier plan
      
        

      dot.attr("transform", () => {
        var a = window.global.tracksX(window.global.tracksData.dates[i])
        var b = window.global.tracksY(s.values[i])

        // console.log(pointer[0])
        if(pointer[1] - 170 <= 0 && pointer[0] <= 220){
          dot.select("#polyLineTracks")
              .attr("transform", "translate(-45, 30)");
          d3.selectAll(".trackText")
            .attr("transform", "translate(170, 200)");
        }
        else if(pointer[1] - 170 <= 0 && pointer[0] > 600){
          dot.select("#polyLineTracks")
              .attr("transform", "translate(-415, 30)");
          d3.selectAll(".trackText")
            .attr("transform", "translate(-200, 200)");
        }
        else if(pointer[1] - 170 <= 0 && pointer[0] > 220 && pointer[0] <=600){
          dot.select("#polyLineTracks")
          .attr("transform", "translate(-215, 30)");
          d3.selectAll(".trackText")
          .attr("transform", "translate(0, 200)");
        }
        else if(pointer[0] <= 220) {
          dot.select("#polyLineTracks")
              .attr("transform", "translate(30, -100)");
          d3.selectAll(".trackText")
            .attr("transform", "translate(245, 70)");
        } 
        else if(pointer[0] > 600) {
          dot.select("#polyLineTracks")
              .attr("transform", "translate(-450, -100)");
          d3.selectAll(".trackText")
            .attr("transform", "translate(-245, 70)");
        }
        else {
          dot.select("#polyLineTracks")
              .attr("transform", "translate(-215, -170)");
          d3.selectAll(".trackText")
            .attr("transform", "translate(0, 0)");
        }

        return `translate(${a},${b})`
      }); // translation

      var t = window.global.fullTracks.get(s.trackId)[0]
      var al = window.global.fullAlbums.get(t.album)[0].name
      var ar = window.global.fullArtists.get(t.artists[0])[0].name
      t = t.name

      var count = 25;

      dot.select("#dot-name")
        .text(t); 
      
      d3.select('#dot-date')
        .text(() => {
          var tt = "Artist :  " + ar
          return tt.slice(0, count) + (tt.length > count ? "..." : "");
        }); 
      
      d3.select('#dot-values')
          .text(() => {
            var tt = "Album :  "+ al
            return tt.slice(0, count) + (tt.length > count ? "..." : "");
          }); 

      d3.select('#dot-listen')
          .text(() => {
            var tt = dateFormat(window.global.tracksData.dates[i])
            return tt.slice(0, count) + (tt.length > count ? "..." : "");
          }); 

      d3.select('#dot-datee')
          .text(() => {
            //var tt = ""+s.values[i].toFixed(2)+" minute(s)"
            var tt = ""+timeToString(s.values[i]) 
            return tt.slice(0, count) + (tt.length > count ? "..." : "");
          }); 
      
    }
    
    
  // définit ce qu'il se passe à l'entrée de la souris dans le graphe
    function entered() {
      path.style("mix-blend-mode", null).attr("stroke", "#ddd");
      dot.attr("display", null); // aucun affichage
    }

  // définit ce qu'il se passe à la sortie de la souris dans le graphe
    function left() {
      path.style("mix-blend-mode", "multiply").attr("stroke", (d,a,b) => {
        
        return window.global.trackColorScale(d.mean)
      });
      dot.attr("display", "none"); // aucun affichage
    }
  }

  function movingAverage(arr, interval) {
    let index = interval - 1;
    const length = arr.length + 1;
    let results = [];

    while (index < length) {
      index = index + 1;
      const intervalSlice = arr.slice(index - interval, index);
      const sum = intervalSlice.reduce((prev, curr) => prev + curr, 0);
      results.push(sum / interval);
    }

    return results;
  }