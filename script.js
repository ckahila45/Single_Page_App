document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector("#search-form");
    const searchInput = document.querySelector("#search-input");
    const randomButton = document.querySelector("#random-button");
    const resultPanel = document.querySelector("#result");

    const maxPokemonId = 1025;

    const formatName = (name) => {
        return name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatStatName = (name) => {
        const statNames = {
            hp: "HP",
            attack: "Attack",
            defense: "Defense",
            "special-attack": "Sp. Attack",
            "special-defense": "Sp. Defense",
            speed: "Speed"
        };

        return statNames[name] || formatName(name);
    };

    const showLoading = () => {
        resultPanel.innerHTML = `
            <div class="loading-state">
                <p class="screen-label">LOADING</p>
                <h2 id="result-heading">Searching Pokédex...</h2>
                <p>Retrieving Pokémon data.</p>
            </div>
        `;
    };

    const showError = () => {
        resultPanel.innerHTML = `
            <div class="error-state">
                <p class="screen-label">ERROR</p>
                <h2 id="result-heading">Pokémon not found</h2>
                <p>Check the spelling or try a different Pokédex number.</p>
            </div>
        `;
    };

    const displayPokemon = (pokemon) => {
        const artwork =
            pokemon.sprites.other?.["official-artwork"]?.front_default;

        const image =
            artwork ||
            pokemon.sprites.front_default ||
            "";

        const types = pokemon.types
            .map(({ type }) => `
                <li class="type-badge type-${type.name}">
                    ${formatName(type.name)}
                </li>
            `)
            .join("");

        const abilities = pokemon.abilities
            .map(({ ability }) => `
                <li>${formatName(ability.name)}</li>
            `)
            .join("");

        const stats = pokemon.stats
            .map(({ base_stat: value, stat }) => {
                const width = Math.min((value / 180) * 100, 100);

                return `
                    <li class="stat-row">
                        <span class="stat-name">${formatStatName(stat.name)}</span>
                        <span class="stat-bar" aria-hidden="true">
                            <span class="stat-fill" style="width: ${width}%"></span>
                        </span>
                        <span class="stat-value">${value}</span>
                    </li>
                `;
            })
            .join("");

        resultPanel.innerHTML = `
            <article class="pokemon-card">
                <div class="pokemon-visual">
                    <img
                        src="${image}"
                        alt="${formatName(pokemon.name)} official artwork"
                        width="475"
                        height="475"
                    >
                </div>

                <div class="pokemon-info">
                    <p class="pokemon-number">
                        #${String(pokemon.id).padStart(4, "0")}
                    </p>

                    <h2 id="result-heading" class="pokemon-name">
                        ${formatName(pokemon.name)}
                    </h2>

                    <ul class="type-list" aria-label="Pokémon types">
                        ${types}
                    </ul>

                    <dl class="measurements">
                        <div>
                            <dt>Height</dt>
                            <dd>${(pokemon.height / 10).toFixed(1)} m</dd>
                        </div>

                        <div>
                            <dt>Weight</dt>
                            <dd>${(pokemon.weight / 10).toFixed(1)} kg</dd>
                        </div>
                    </dl>

                    <div class="details-grid">
                        <section aria-labelledby="abilities-heading">
                            <h3 id="abilities-heading">Abilities</h3>
                            <ul class="ability-list">
                                ${abilities}
                            </ul>
                        </section>

                        <section aria-labelledby="stats-heading">
                            <h3 id="stats-heading">Base Stats</h3>
                            <ul class="stat-list">
                                ${stats}
                            </ul>
                        </section>
                    </div>
                </div>
            </article>
        `;
    };

    const fetchPokemon = async (searchValue) => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return;
        }

        showLoading();

        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error("Pokémon not found");
            }

            const pokemon = await response.json();
            displayPokemon(pokemon);
        } catch (error) {
            console.error(error);
            showError();
        }
    };

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        fetchPokemon(searchInput.value);
    });

    randomButton.addEventListener("click", () => {
        const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
        searchInput.value = randomId;
        fetchPokemon(String(randomId));
    });
});
