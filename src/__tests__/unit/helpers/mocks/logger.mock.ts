import { sinon } from "@loopback/testlab/dist/sinon";
import logger from "electron-log/main";
import { generateUniqueId } from "@loopback/core";

export const getMockLogger = () =>
  sinon.stub(logger.create({ logId: generateUniqueId() }));
