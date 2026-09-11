import { useEffect } from "react";

/*
  =========================================================
  ARTIST DIRECTORY BACKGROUND PREFETCH

  Put this component once inside App.jsx.

  What it does:
  - Website opens on Home / About / any page
  - waits a tiny moment so it does not block the first paint
  - quietly downloads page 1 (20 artists)
  - quietly downloads city filters
  - saves both in localStorage
  - when user later opens /artists, Artists.jsx can display immediately

  It never renders anything.
  =========================================================
*/

const ARTIST_CACHE_KEY = "inkConventionArtistsPageCacheV2";
const CITY_FILTER_CACHE_KEY = "inkConventionArtistCitiesV1";

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

function getPageOneCacheKey() {
  return ["page", 0, "city", "ALL", "search", ""].join(":");
}

function saveArtistPage(data) {
  try {
    const results = Array.isArray(data?.artists)
      ? data.artists
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
          ? data.users
          : [];

    /*
      Artists.jsx currently hides legacy Silver / Pro records,
      so keep the preload aligned with that page.
    */
    const artists = results.filter((artist) => {
      const plan = String(artist?.plan || "")
        .trim()
        .toLowerCase();

      return plan !== "pro" && plan !== "silver";
    });

    const raw = localStorage.getItem(ARTIST_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};

    cache[getPageOneCacheKey()] = {
      artists,
      totalArtists: Number(
        data?.pagination?.total || data?.total || results.length,
      ),
      totalArtistPages: Math.max(
        1,
        Number(data?.pagination?.totalPages || data?.totalPages || 1),
      ),
      savedAt: Date.now(),
    };

    localStorage.setItem(ARTIST_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Artist preload cache save skipped:", error);
  }
}

function saveCities(data) {
  try {
    const cities = Array.isArray(data?.filters?.cities)
      ? data.filters.cities
      : [];

    const uniqueCities = Array.from(
      new Set(
        cities
          .map((city) =>
            String(city || "")
              .trim()
              .toUpperCase(),
          )
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    localStorage.setItem(
      CITY_FILTER_CACHE_KEY,
      JSON.stringify({
        cities: uniqueCities,
        savedAt: Date.now(),
      }),
    );
  } catch (error) {
    console.warn("City preload cache save skipped:", error);
  }
}

export default function ArtistPrefetchBootstrap() {
  useEffect(() => {
    const controller = new AbortController();

    /*
      Give the current page priority.
      Start directory prefetch shortly after initial paint.
    */
    const timer = window.setTimeout(async () => {
      try {
        const existingRaw = localStorage.getItem(ARTIST_CACHE_KEY);

        let hasRecentPageOne = false;

        if (existingRaw) {
          try {
            const existing = JSON.parse(existingRaw);
            const pageOne = existing?.[getPageOneCacheKey()];

            hasRecentPageOne =
              Array.isArray(pageOne?.artists) &&
              pageOne.artists.length > 0 &&
              Date.now() - Number(pageOne?.savedAt || 0) < 5 * 60 * 1000;
          } catch {
            hasRecentPageOne = false;
          }
        }

        /*
          Don't waste another request if we already have fresh page 1.
        */
        if (!hasRecentPageOne) {
          const response = await fetch(
            `${API_URL}/api/admin/tattoo-studios?page=1&limit=20`,
            {
              signal: controller.signal,
              credentials: "include",
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            saveArtistPage(data);
          }
        }

        /*
          Filters are lower priority.
          Fetch them after artist page 1 so they never delay cards.
        */
        if (!controller.signal.aborted) {
          window.setTimeout(async () => {
            try {
              const cityRaw = localStorage.getItem(CITY_FILTER_CACHE_KEY);

              let citiesFresh = false;

              if (cityRaw) {
                try {
                  const cityCache = JSON.parse(cityRaw);

                  citiesFresh =
                    Array.isArray(cityCache?.cities) &&
                    Date.now() - Number(cityCache?.savedAt || 0) <
                      24 * 60 * 60 * 1000;
                } catch {
                  citiesFresh = false;
                }
              }

              if (citiesFresh || controller.signal.aborted) {
                return;
              }

              const response = await fetch(
                `${API_URL}/api/admin/tattoo-studios/filters`,
                {
                  signal: controller.signal,
                  credentials: "include",
                  headers: {
                    Accept: "application/json",
                  },
                },
              );

              if (response.ok) {
                const data = await response.json();
                saveCities(data);
              }
            } catch (error) {
              if (error?.name !== "AbortError") {
                console.warn("City background preload skipped:", error);
              }
            }
          }, 1500);
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.warn("Artist background preload skipped:", error);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return null;
}
