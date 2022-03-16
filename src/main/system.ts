import path from "path";

export const getLocalAppData = () =>
  path.resolve(`${process.env.APPDATA}/../local`);
