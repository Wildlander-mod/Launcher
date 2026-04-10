// No logic to test — this file only re-exports a mitt event emitter instance and two string constants.
/* istanbul ignore file */
import mitt from "mitt";

export const ENABLE_LOADING_EVENT = "ENABLE_LOADING_EVENT";
export const DISABLE_LOADING_EVENT = "DISABLE_LOADING_EVENT";

export const EventService = mitt();
