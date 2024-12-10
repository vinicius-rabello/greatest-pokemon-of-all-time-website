// Unique types and generations
const uniqueTypes = new Set();
const uniqueGenerations = new Set();

// Function to convert column names
function formatColumnName(key) {
    // Specific mappings for certain columns
    const specialMappings = {
        'pokemon_id': '#',
        'pokemon_name': 'Name',
        'type_1': 'Primary Type',
        'type_2': 'Secondary Type',
        'greatness_metric': 'Greatness',
        'gen': 'Generation',
        'longevity': 'Longevity',
        'times_won_world': 'Worlds Wins',
        'times_won_international': 'Intl Wins',
        'times_won_national': 'Natl Wins',
        'times_won_regional': 'Regional',
        'times_won_other': 'Other Wins',
        'img_url': ' '
    };

    // Return mapped name if exists, otherwise do some default formatting
    return specialMappings[key] || key
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function createTable(data) {
    // Clear previous table
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const tableHead = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    table.appendChild(tableHead);
    table.appendChild(tableBody);

    // Create header row
    let headerRow = tableHead.insertRow();
    const keys = Object.keys(data[0]);
    keys.forEach(key => {
        let th = document.createElement('th');
        th.textContent = formatColumnName(key);
        headerRow.appendChild(th);
    });

    // Create data rows
    data.forEach(item => {
        // Collect unique types and generations
        if (item.type_1) uniqueTypes.add(item.type_1);
        if (item.type_2) uniqueTypes.add(item.type_2);
        uniqueGenerations.add(item.gen);

        let row = tableBody.insertRow();
        keys.forEach((key, index) => {
            let cell = row.insertCell();
            
            // Special handling for the image URL column
            if (key === 'img_url') {
                const img = document.createElement('img');
                img.src = item[key];
                img.alt = `${item['pokemon_name']} sprite`;
                img.classList.add('pokemon-image');
                cell.appendChild(img);
            } else {
                // For other columns, display text normally
                cell.textContent = item[key] ?? 'N/A';
            }
        });
    });

    tableContainer.appendChild(table);

    // Populate type and generation filters
    populateFilters();
}

function populateFilters() {
    const typeFilter = document.getElementById('type-filter');
    const generationFilter = document.getElementById('generation-filter');

    // Save the current selections
    const selectedType = typeFilter.value;
    const selectedGeneration = parseInt(generationFilter.value);

    // Clear existing options beyond the first
    while (typeFilter.options.length > 1) {
        typeFilter.remove(1);
    }
    while (generationFilter.options.length > 1) {
        generationFilter.remove(1);
    }

    // Populate type filter
    [...uniqueTypes].sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        if (type === selectedType) {
            option.selected = true; // Restore previous selection
        }
        typeFilter.appendChild(option);
    });

    // Populate generation filter
    [...uniqueGenerations].sort((a, b) => a - b).forEach(gen => {
        const option = document.createElement('option');
        option.value = gen;
        option.textContent = `Gen ${gen}`;
        if (gen === selectedGeneration) {
            option.selected = true; // Restore previous selection
        }
        generationFilter.appendChild(option);
    });
}

async function fetchPokemonData() {
    // Get selected filters
    const typeFilter = document.getElementById('type-filter').value;
    const generationFilter = document.getElementById('generation-filter').value;

    // Construct query parameters
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (generationFilter) params.append('generation', generationFilter);

    try {
        const response = await fetch(`https://greatest-pokemon-of-all-time-website.onrender.com/pokemon?${params.toString()}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.length == 0) {
            const tableContainer = document.getElementById('table-container');
            tableContainer.innerHTML = `<div style="padding: 15px; text-align: center;">No suitable Pokémon found.</div>`;
        } else {
            createTable(data);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = `<div style="padding: 15px; text-align: center;">Failed to load data. Please check the server.</div>`;
    }
}

// Add event listeners to filters
document.getElementById('type-filter').addEventListener('change', fetchPokemonData);
document.getElementById('generation-filter').addEventListener('change', fetchPokemonData);

// Initial data fetch
async function main() {
    await fetchPokemonData();
}

main();