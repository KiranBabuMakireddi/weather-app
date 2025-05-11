/** @format */
"use client";

import React, { useEffect } from "react";
import { MdOutlineLocationOn, MdWbSunny } from "react-icons/md";
import { MdMyLocation } from "react-icons/md";
import SearchBox from "./SearchBox";
import { useState } from "react";
import axios from "axios";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { useAtom } from "jotai";
import { useTheme } from "@/context/theme-context";

type Props = { location?: string };

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Navbar({ location }: Props) {
    const { theme, toggleTheme } = useTheme();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  //
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  // async function handleInputChang(value: string) {
  //   setCity(value);
  //   if (value.length >= 3) {
  //     try {
  //       const response = await axios.get(
  //         `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
  //       );

  //       const suggestions = response.data.list.map((item: any) => item.name);
  //       setSuggestions(suggestions);
  //       setError("");
  //       setShowSuggestions(true);
  //     } catch (error) {
  //       setSuggestions([]);
  //       setShowSuggestions(false);
  //     }
  //   } else {
  //     setSuggestions([]);
  //     setShowSuggestions(false);
  //   }
  // }

  async function handleInputChang(value: string) {
  setCity(value);
  setError("");
  if (value.length >= 3) {
    try {
      let response;
      // Check if input is numeric (zip code)
      if (/^\d+$/.test(value)) {
        response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?zip=${value},us&appid=${API_KEY}`
        );

        const cityName = response.data.name;
        setSuggestions([cityName]);
      } else {
        // City name logic
        response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
        );
        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
      }

      setShowSuggestions(true);
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  } else {
    setSuggestions([]);
    setShowSuggestions(false);
  }
}


  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  // function handleSubmiSearch(e: React.FormEvent<HTMLFormElement>) {
  //   setLoadingCity(true);
  //   e.preventDefault();
  //   if (suggestions.length == 0) {
  //     setError("Location not found");
  //     setLoadingCity(false);
  //   } else {
  //     setError("");
  //     setTimeout(() => {
  //       setLoadingCity(false);
  //       setPlace(city);
  //       setShowSuggestions(false);
  //     }, 500);
  //   }
  // }

function handleSubmiSearch(e: React.FormEvent<HTMLFormElement>) {
  setLoadingCity(true);
  e.preventDefault();

  if (!city) {
    setError("Please enter a location or zip code");
    setLoadingCity(false);
    return;
  }

  if (suggestions.length === 0 && !/^\d+$/.test(city)) {
    setError("Location not found");
    setLoadingCity(false);
  } else {
    setError("");
    setTimeout(() => {
      setLoadingCity(false);
      setPlace(city);
      setShowSuggestions(false);
    }, 500);
  }
}

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setLoadingCity(true);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        setTimeout(() => {
          setLoadingCity(false);
          setPlace(response.data.name); // this will update the global state
        }, 500);
      } catch (error) {
        setLoadingCity(false);
        console.error("Error fetching default location weather:", error);
      }
    });
  }
}, []);

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (postiion) => {
        const { latitude, longitude } = postiion.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }
  return (
    <>
      <nav className="shadow-sm  sticky top-0 left-0 z-50 bg-white dark:bg-black">
        <div className="h-[80px]     w-full    flex   justify-between items-center  max-w-7xl px-3 mx-auto">
          <p className="flex items-center justify-center gap-2  ">
            <h2 className="text-gray-500 dark:text-white text-3xl">Weather App</h2>
            <MdWbSunny className="text-3xl mt-1 text-yellow-300 " />
          </p>
          {/*  */}
          <section className="flex gap-2 items-center">
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl  text-gray-400 dark:text-white hover:opacity-80 cursor-pointer"
            />
            <MdOutlineLocationOn className="text-3xl dark:text-white text-slate-900" />
            <p className="text-slate-900/80 dark:text-gray-100 text-sm"> {location} </p>
            <div className="relative hidden md:flex">
              {/* SearchBox */}

              <SearchBox
                value={city}
                onSubmit={handleSubmiSearch}
                onChange={(e) => handleInputChang(e.target.value)}
              />
              <SuggetionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error
                }}
              />
              <button
              onClick={toggleTheme}
              className="p-2 rounded text-sm bg-gray-200 dark:bg-gray-700 dark:text-white transition-all ml-2"
            >
              {theme === "light" ? "🌞 Light" : "🌚 Dark"}
            </button>
            </div>
          </section>
        </div>
      </nav>
      <section className="flex   max-w-7xl px-3 md:hidden ">
        <div className="relative ">
          {/* SearchBox */}

          <SearchBox
            value={city}
            onSubmit={handleSubmiSearch}
            onChange={(e) => handleInputChang(e.target.value)}
          />
          <SuggetionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error
            }}
          />
            <button
      onClick={toggleTheme}
      className="p-2 rounded text-sm bg-gray-200 dark:bg-gray-700 dark:text-white transition-all ml-2"
    >
      {theme === "light" ? "🌞 Light" : "🌚 Dark"}
    </button>
        </div>
      
      </section>
    </>
  );
}

function SuggetionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px]  flex flex-col gap-1 py-2 px-2">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1 "> {error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              className="cursor-pointer p-1 rounded   hover:bg-gray-200"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
