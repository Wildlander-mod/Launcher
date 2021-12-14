import find from "find-process";

export const closeGame = async () =>
  (await find("name", "SkyrimSE.exe")).forEach((skyrim) => {
    process.kill(skyrim.pid);
  });
