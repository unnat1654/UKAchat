import { useContext, createContext, useState } from "react";

const wallpaperModules = import.meta.glob("../assets/wallpapers/*", {
  eager: true,
  as: "url",
});
const defaultWallpapers = Object.values(wallpaperModules);

const WallpaperContext = createContext();

const WallpaperProvider = ({ children }) => {
  const [customWallpaper, setCustomWallpaperState] = useState(
    localStorage.getItem("customWallpaper") || ""
  );
  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("wallpaperIndex");
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });

  const cycleList = customWallpaper
    ? [...defaultWallpapers, customWallpaper]
    : defaultWallpapers;
  const safeIndex = cycleList.length
    ? ((index % cycleList.length) + cycleList.length) % cycleList.length
    : 0;
  const wallpaper = cycleList[safeIndex] || "";

  const setCustomWallpaper = (dataUrl) => {
    localStorage.setItem("customWallpaper", dataUrl);
    setCustomWallpaperState(dataUrl);
    const newList = [...defaultWallpapers, dataUrl];
    const newIndex = newList.length - 1;
    localStorage.setItem("wallpaperIndex", String(newIndex));
    setIndex(newIndex);
  };

  const removeCustomWallpaper = () => {
    localStorage.removeItem("customWallpaper");
    setCustomWallpaperState("");
    localStorage.setItem("wallpaperIndex", "0");
    setIndex(0);
  };

  const cycleWallpaper = () => {
    const len = cycleList.length;
    if (!len) return;
    const next = (safeIndex + 1) % len;
    localStorage.setItem("wallpaperIndex", String(next));
    setIndex(next);
  };

  return (
    <WallpaperContext.Provider
      value={{
        wallpaper,
        customWallpaper,
        setCustomWallpaper,
        removeCustomWallpaper,
        cycleWallpaper,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};

const useWallpaper = () => useContext(WallpaperContext);

export { useWallpaper, WallpaperProvider };
