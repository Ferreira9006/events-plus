// Location autocomplete using Nominatim (OpenStreetMap)
(function () {
  // Get DOM elements used for location search and suggestions
  const input = document.getElementById("location");
  const suggestionsEl = document.getElementById("location-suggestions");
  const latInput = document.getElementById("location-lat");
  const lonInput = document.getElementById("location-lon");

  // Abort if elements are not found (e.g., script loaded on a different page)
  if (!input || !suggestionsEl) return;

  let timeoutId = null;

  // Clear the suggestions list and hide the dropdown
  function clearSuggestions() {
    suggestionsEl.innerHTML = "";
    suggestionsEl.classList.add("hidden");
  }

  // Create a single suggestion list item element
  function createSuggestionItem(label, feature) {
    const li = document.createElement("li");
    li.textContent = label;
    li.className = "px-3 py-2 cursor-pointer hover:bg-slate-100";

    // Handle suggestion click: fill input and update coordinates
    li.addEventListener("click", () => {
      input.value = label;

      // Store selected coordinates in hidden inputs (if available)
      if (feature && feature.geometry && Array.isArray(feature.geometry.coordinates)) {
        const [lon, lat] = feature.geometry.coordinates;
        if (latInput) latInput.value = lat;
        if (lonInput) lonInput.value = lon;
      }

      clearSuggestions();
    });

    return li;
  }

  // Fetch location suggestions from Nominatim API
  async function searchLocations(query) {
    // Do not search for very short queries
    if (!query || query.length < 3) {
      clearSuggestions();
      return;
    }

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=" +
        encodeURIComponent(query);

      const res = await fetch(url, {
        headers: {
          // Ask for Portuguese language results when possible
          "Accept-Language": "pt",
        },
      });

      if (!res.ok) {
        clearSuggestions();
        return;
      }

      const data = await res.json();

      // If no results were found, clear dropdown
      if (!Array.isArray(data) || !data.length) {
        clearSuggestions();
        return;
      }

      suggestionsEl.innerHTML = "";

      // Build dropdown items for each result
      data.forEach((place) => {
        const label = place.display_name; // User-facing text (address string)
        if (!label) return;

        // Normalize coordinates into a similar shape used before (geometry.coordinates)
        const feature = {
          geometry: {
            coordinates: [Number(place.lon), Number(place.lat)],
          },
        };

        const li = createSuggestionItem(label, feature);
        suggestionsEl.appendChild(li);
      });

      // Show or hide dropdown depending on available suggestions
      if (suggestionsEl.children.length > 0) {
        suggestionsEl.classList.remove("hidden");
      } else {
        clearSuggestions();
      }
    } catch (err) {
      console.error("[Nominatim] Error fetching locations:", err);
      clearSuggestions();
    }
  }

  // Debounced input handler: trigger search after short delay
  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 400);
  });

  // Hide suggestions shortly after losing focus (to allow click)
  input.addEventListener("blur", () => {
    setTimeout(clearSuggestions, 200);
  });

  // When focusing the field, optionally load suggestions if query is long enough
  input.addEventListener("focus", () => {
    const query = input.value.trim();
    if (query.length >= 3) {
      searchLocations(query);
    }
  });
})();
