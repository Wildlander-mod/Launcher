import { backupOriginalENBs, copyENBFiles, getENBPresets } from "@/main/ENB";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";

export async function startupTasks() {
  await backupOriginalENBs();

  const ENBFiles =
    (userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE) as string) ||
    (await getENBPresets())[0].real;
  await copyENBFiles(ENBFiles, false);
}
