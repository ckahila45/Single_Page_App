document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector("#search-form");
    const searchInput = document.querySelector("#search-input");
    const randomButton = document.querySelector("#random-button");
    const clearButton = document.querySelector("#clear-button");
    const clearHistoryButton = document.querySelector("#clear-history-button");
    const recentList = document.querySelector("#recent-list");
    const resultPanel = document.querySelector("#result");

    const maxPokemonId = 1025;
    const recentSearchKey = "recentPokemonSearches";
    const defaultAccent = "#f4d35e";

    const typeColors = {
        normal: "#A8A77A",
        fire: "#EE8130",
        water: "#6390F0",
        electric: "#F7D02C",
        grass: "#7AC74C",
        ice: "#96D9D6",
        fighting: "#C22E28",
        poison: "#A33EA1",
        ground: "#E2BF65",
        flying: "#A98FF3",
        psychic: "#F95587",
        bug: "#A6B91A",
        rock: "#B6A136",
        ghost: "#735797",
        dragon: "#6F35FC",
        dark: "#705746",
        steel: "#B7B7CE",
        fairy: "#D685AD"
    };

    const formatName = (name) => {
        return name
            .split("-")
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
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

    const showEmptyState = () => {
        resultPanel.innerHTML = `
            <div class="empty-state">
                <p class="screen-label">READY</p>

                <h2 id="result-heading">
                    Waiting for a search
                </h2>

                <p>
                    Enter a Pokémon above to load PokéAPI data.
                </p>
            </div>
        `;
    };

    const showLoading = () => {
        resultPanel.innerHTML = `
            <div class="loading-state">
                <p class="screen-label">LOADING</p>

                <h2 id="result-heading">
                    Searching Pokédex...
                </h2>

                <p>
                    Retrieving Pokémon data.
                </p>
            </div>
        `;
    };

    const showError = (searchValue) => {
        resultPanel.innerHTML = `
            <div class="error-state">
                <p class="screen-label">NO MATCH</p>

                <h2 id="result-heading">
                    Pokémon not found
                </h2>

                <p>
                    We couldn't find "${searchValue}".
                    Check the spelling or try a valid Pokédex number.
                </p>
            </div>
        `;
    };

    const setTypeAccent = (pokemon) => {
        const primaryType = pokemon.types[0]?.type.name;
        const accent = typeColors[primaryType] || defaultAccent;

        document.documentElement.style.setProperty(
            "--type-accent",
            accent
        );
    };

    const resetTypeAccent = () => {
        document.documentElement.style.setProperty(
            "--type-accent",
            defaultAccent
        );
    };

    const getRecentSearches = () => {
        try {
            return JSON.parse(
                localStorage.getItem(recentSearchKey)
            ) || [];
        } catch (error) {
            return [];
        }
    };

    const renderRecentSearches = () => {
        const recentSearches = getRecentSearches();

        if (recentSearches.length === 0) {
            recentList.innerHTML = `
                <li class="recent-empty">
                    No recent searches yet.
                </li>
            `;

            return;
        }

        recentList.innerHTML = recentSearches
            .map((pokemon) => {
                return `
                    <li>
                        <button
                            class="history-button"
                            type="button"
                            data-pokemon="${pokemon.name}"
                        >
                            ${formatName(pokemon.name)}
                            #${String(pokemon.id).padStart(4, "0")}
                        </button>
                    </li>
                `;
            })
            .join("");
    };

    const saveRecentSearch = (pokemon) => {
        const recentSearches = getRecentSearches().filter(
            (item) => item.name !== pokemon.name
        );

        recentSearches.unshift({
            name: pokemon.name,
            id: pokemon.id
        });

        localStorage.setItem(
            recentSearchKey,
            JSON.stringify(recentSearches.slice(0, 5))
        );

        renderRecentSearches();
    };

    const displayPokemon = (pokemon) => {
        const artwork =
            pokemon.sprites.other?.["official-artwork"]?.front_default;

        const image =
            artwork ||
            pokemon.sprites.front_default ||
            "";

        const types = pokemon.types
            .map(({ type }) => {
                return `
                    <li class="type-badge type-${type.name}">
                        ${formatName(type.name)}
                    </li>
                `;
            })
            .join("");

        const abilities = pokemon.abilities
            .map(({ ability }) => {
                return `
                    <li>
                        ${formatName(ability.name)}
                    </li>
                `;
            })
            .join("");

        const stats = pokemon.stats
            .map(({ base_stat: value, stat }) => {
                const width = Math.min(
                    (value / 180) * 100,
                    100
                );

                return `
                    <li class="stat-row">
                        <span class="stat-name">
                            ${formatStatName(stat.name)}
                        </span>

                        <span
                            class="stat-bar"
                            aria-hidden="true"
                        >
                            <span
                                class="stat-fill"
                                style="width: ${width}%"
                            ></span>
                        </span>

                        <span class="stat-value">
                            ${value}
                        </span>
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

                    <h2
                        id="result-heading"
                        class="pokemon-name"
                    >
                        ${formatName(pokemon.name)}
                    </h2>

                    <ul
                        class="type-list"
                        aria-label="Pokémon types"
                    >
                        ${types}
                    </ul>

                    <dl class="measurements">
                        <div>
                            <dt>Height</dt>
                            <dd>
                                ${(pokemon.height / 10).toFixed(1)} m
                            </dd>
                        </div>

                        <div>
                            <dt>Weight</dt>
                            <dd>
                                ${(pokemon.weight / 10).toFixed(1)} kg
                            </dd>
                        </div>

                        <div>
                            <dt>Base Experience</dt>
                            <dd>
                                ${pokemon.base_experience ?? "N/A"}
                            </dd>
                        </div>
                    </dl>

                    <div class="details-grid">
                        <section
                            aria-labelledby="abilities-heading"
                        >
                            <h3 id="abilities-heading">
                                Abilities
                            </h3>

                            <ul class="ability-list">
                                ${abilities}
                            </ul>
                        </section>

                        <section
                            aria-labelledby="stats-heading"
                        >
                            <h3 id="stats-heading">
                                Base Stats
                            </h3>

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
        const query = searchValue
            .trim()
            .toLowerCase();

        if (!query) {
            return;
        }

        resetTypeAccent();
        showLoading();

        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error("Pokémon not found");
            }

            const pokemon = await response.json();

            setTypeAccent(pokemon);
            displayPokemon(pokemon);
            saveRecentSearch(pokemon);
        } catch (error) {
            console.error(error);

            resetTypeAccent();
            showError(searchValue);
        }
    };

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        fetchPokemon(searchInput.value);
    });

    randomButton.addEventListener("click", () => {
        const randomId =
            Math.floor(Math.random() * maxPokemonId) + 1;

        searchInput.value = randomId;

        fetchPokemon(String(randomId));
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";

        resetTypeAccent();
        showEmptyState();

        searchInput.focus();
    });

    clearHistoryButton.addEventListener("click", () => {
        localStorage.removeItem(recentSearchKey);

        renderRecentSearches();
    });

    recentList.addEventListener("click", (event) => {
        const historyButton = event.target.closest(
            ".history-button"
        );

        if (!historyButton) {
            return;
        }

        const pokemonName = historyButton.dataset.pokemon;

        searchInput.value = pokemonName;

        fetchPokemon(pokemonName);
    });

    renderRecentSearches();
});