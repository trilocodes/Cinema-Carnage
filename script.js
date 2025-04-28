// script.js
// Constants
const killCountByDecadeMargin = {top: 10, right: 20, bottom: 40, left: 100},
    killCountByDecadeWidth = 1000 - killCountByDecadeMargin.left - killCountByDecadeMargin.right,
    killCountByDecadeHeight = 400 - killCountByDecadeMargin.top - killCountByDecadeMargin.bottom;

const genreByDecadeMargin = {top: 10, right: 150, bottom: 40, left: 100},
    genreByDecadeWidth = 1000 - genreByDecadeMargin.left - genreByDecadeMargin.right,
    genreByDecadeHeight = 400 - genreByDecadeMargin.top - genreByDecadeMargin.bottom;

document.addEventListener('DOMContentLoaded', function() {
    // Add click event to stars for rating
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Create a simple chart in the graph placeholder
    const graph = document.querySelector('.graph-placeholder');
    if (graph) {
        // This would be more elaborate with actual charting library
        const canvas = document.createElement('div');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'relative';
        
        // Add some random data points
        for (let i = 0; i < 20; i++) {
            const point = document.createElement('div');
            const rating = Math.random() * 10;
            const kills = Math.random() * 100;
            
            point.style.position = 'absolute';
            point.style.width = '10px';
            point.style.height = '10px';
            point.style.backgroundColor = '#ff0000';
            point.style.borderRadius = '50%';
            point.style.left = `${rating * 8}%`;
            point.style.bottom = `${kills}%`;
            point.style.transform = 'translate(-50%, 50%)';
            
            // Bigger dots for more kills
            const size = 5 + (kills / 20);
            point.style.width = `${size}px`;
            point.style.height = `${size}px`;
            
            canvas.appendChild(point);
        }
        
        // Add axes
        const xAxis = document.createElement('div');
        xAxis.style.position = 'absolute';
        xAxis.style.bottom = '0';
        xAxis.style.left = '0';
        xAxis.style.right = '0';
        xAxis.style.height = '1px';
        xAxis.style.backgroundColor = '#ff0000';
        canvas.appendChild(xAxis);
        
        const yAxis = document.createElement('div');
        yAxis.style.position = 'absolute';
        yAxis.style.bottom = '0';
        yAxis.style.left = '0';
        yAxis.style.top = '0';
        yAxis.style.width = '1px';
        yAxis.style.backgroundColor = '#ff0000';
        canvas.appendChild(yAxis);
        
        // Add labels
        const xLabel = document.createElement('div');
        xLabel.textContent = 'IMDB Rating';
        xLabel.style.position = 'absolute';
        xLabel.style.bottom = '-30px';
        xLabel.style.left = '50%';
        xLabel.style.transform = 'translateX(-50%)';
        xLabel.style.color = '#ff0000';
        canvas.appendChild(xLabel);
        
        const yLabel = document.createElement('div');
        yLabel.textContent = 'Kill Count';
        yLabel.style.position = 'absolute';
        yLabel.style.left = '-40px';
        yLabel.style.top = '50%';
        yLabel.style.transform = 'translateY(-50%) rotate(-90deg)';
        yLabel.style.color = '#ff0000';
        canvas.appendChild(yLabel);
        
        graph.appendChild(canvas);
    }

    // Add scroll snapping behavior
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            setTimeout(() => {
                const sections = document.querySelectorAll('section');
                let currentSection = 0;
                
                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        currentSection = index;
                    }
                });
                
                sections[currentSection].scrollIntoView({ behavior: 'smooth' });
                isScrolling = false;
            }, 100);
        }
    });

    createKillCountByDecade();
    createGenreByDecade();
});

// Fetches the data for kill count by decade
async function fetchKillCountByDecadeData() {
    try {
        // Load the CSV data
        const data = await d3.csv('data/movies_kills_year.csv');
        
        // Process the data to get average kill count by decade
        const killCountByDecade = d3.rollups(
            data,
            v => d3.mean(v, d => +d['Total Kill Count']), // Calculate average kill count
            d => Math.floor(d.Year / 10) * 10 // Group by decade
        ).map(([decade, avgKills]) => ({
            decade: new Date(decade, 0, 1), // Convert to Date object (January 1st of the decade year)
            averageKills: avgKills
        })).sort((a, b) => a.decade - b.decade); // Sort by date

        return killCountByDecade;
    } catch (error) {
        console.error('Error loading movies_kills_year.csv:', error);
        return [];
    }
}

// Fetches the data for genre by decade
async function fetchGenreByDecadeData() {
    try {
        // Load the CSV data
        data = await d3.csv('data/genre_counts_by_decade.csv', function(d) {
            return {
                decade: new Date(d.Decade, 0, 1),
                action: +d.Action,
                comedy: +d.Comedy,
                drama: +d.Drama,
                fantasy: +d.Fantasy,
                horror: +d.Horror,
                mystery: +d.Mystery,
                romace: +d.Romance,
                thriller: +d.Thriller,
                western: +d.Western
            }
        });

        // Filter out years before 1900 and 2020
        data = data.filter(d => { return d.decade.getYear() > 0 && d.decade.getYear() < 120; });

        data.columns = ["decade", "action", "comedy", "drama", "fantasy", "horror", "mystery", "romace", "thriller", "western"];

        return data;
    } catch (error) {
        console.error('Error loading genre_counts_by_decade.csv:', error);
        return [];
    }
}

// This function creates a line chart which shows the kill count during each decade
function createKillCountByDecade() {
    const svg = d3.select("#killCountByDecade")
        .attr("width", killCountByDecadeWidth + killCountByDecadeMargin.left + killCountByDecadeMargin.right)
        .attr("height", killCountByDecadeHeight + killCountByDecadeMargin.top + killCountByDecadeMargin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + killCountByDecadeMargin.left + "," + killCountByDecadeMargin.top + ")");
    
    fetchKillCountByDecadeData().then(function(data) {
        console.log(data);

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.decade; }))
            .range([ 0, killCountByDecadeWidth ]);
        svg.append("g")
            .attr("transform", "translate(0," + killCountByDecadeHeight + ")")
            .call(d3.axisBottom(x).ticks(8))

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.averageKills; })])
            .range([ killCountByDecadeHeight, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y))

        // Add X axis label
        svg.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${killCountByDecadeWidth/2}, ${killCountByDecadeHeight + 35})`)
            .style("text-anchor", "middle")
            .text("Decade");

        // Add Y axis label
        svg.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -(killCountByDecadeHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average Kill Count");

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.decade) })
                .y(function(d) { return y(d.averageKills) })
            )
        
        // Add points
        svg.append("g")
        .selectAll("dot")
        .data(data)
        .join("circle")
            .attr("cx", d => x(d.decade))
            .attr("cy", d => y(d.averageKills))
            .attr("r", 5)
            .attr("fill", "red")

        // Add vertical reference lines for famous horror movies
        const famousHorrorMovies = [
            { year: 1960, title: "Psycho" },
            { year: 1973, title: "The Exorcist" },
            { year: 1980, title: "The Shining" },
            { year: 1996, title: "Scream" },
            { year: 2004, title: "Saw" }
        ];

        // Add the reference lines
        svg.append("g")
            .selectAll("line")
            .data(famousHorrorMovies)
            .join("line")
                .attr("x1", d => x(new Date(d.year, 0, 1)))
                .attr("x2", d => x(new Date(d.year, 0, 1)))
                .attr("y1", 0)
                .attr("y2", killCountByDecadeHeight)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5");

        // Add movie labels
        svg.append("g")
            .selectAll("text")
            .data(famousHorrorMovies)
            .join("text")
                .attr("x", d => x(new Date(d.year, 0, 1)) + 5)
                .attr("y", 15)
                .text(d => d.title)
                .style("font-size", "16px")
                .style("fill", "white")
                .attr("transform", d => `rotate(45, ${x(new Date(d.year, 0, 1)) + 5}, 15)`);
    })
}

// This function creates the stacked bar chart showing genre for each 
function createGenreByDecade() {
    const svg = d3.select("#genreByDecade")
        .attr("width", genreByDecadeWidth + genreByDecadeMargin.left + genreByDecadeMargin.right)
        .attr("height", genreByDecadeHeight + genreByDecadeMargin.top + genreByDecadeMargin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + genreByDecadeMargin.left + "," + genreByDecadeMargin.top + ")");
    
    fetchGenreByDecadeData().then(function(data) {
        console.log(data)

        // Get the list of genres (all columns except 'decade')
        const genres = data.columns.slice(1);

        console.log(genres)
        
        // Create color scale for genres
        const color = d3.scaleOrdinal()
            .domain(genres)
            .range(["#8f2100", "#b45102", "#c67c3c", "#c8a589", "#efede9", "#85977f", "#475059", "#786959", "#514656", ]);

        // Create X scale (time scale for decades)
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.decade))
            .range([40, genreByDecadeWidth - 40]);

        // Create Y scale (linear scale for percentages)
        const y = d3.scaleLinear()
            .domain([0, 100]) // 0 to 100 percent
            .range([genreByDecadeHeight, 0]);

        // Convert raw numbers to percentages
        const percentageData = data.map(d => {
            const total = d3.sum(genres, genre => d[genre]);
            const percentages = {};
            genres.forEach(genre => {
                percentages[genre] = (d[genre] / total) * 100;
            });
            return {
                decade: d.decade,
                ...percentages
            };
        });

        // Stack the percentage data
        const stackedData = d3.stack()
            .keys(genres)
            (percentageData);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0, ${genreByDecadeHeight})`)
            .call(d3.axisBottom(x).ticks(11))
            .append("path")
                .attr("d", `M 0 0 V 0 H ${genreByDecadeWidth}`)
                .attr("stroke", "white")

        // Add Y axis with percentage format
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))

        // Add X axis label
        svg.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${genreByDecadeWidth/2}, ${genreByDecadeHeight + 35})`)
            .style("text-anchor", "middle")
            .text("Decade");

        // Add Y axis label
        svg.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -(genreByDecadeHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percentage of Movies");

        // Calculate bar width based on the number of decades
        const barWidth = 60;

        // Create the stacked bars
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.decade) - barWidth/2) // Center the bar over the decade
            .attr("y", d => y(d[1]) - 1)
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", barWidth);

        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(genres)
            .join("g")
            .attr("transform", (d, i) => `translate(${genreByDecadeWidth + 20},${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 16)
            .text(d => d.charAt(0).toUpperCase() + d.slice(1))
            .style("fill", "red")
            .style("font-size", 15);
    });
}