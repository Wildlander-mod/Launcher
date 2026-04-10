<template>
  <nav class="c-navigation">
    <div class="c-navigation__actions">
      <BaseButton
        type="primary"
        size="grow"
        data-testid="launch-game"
        :disabled="isLoading"
        @click="isLoading ? undefined : launchGame()"
      >
        Launch Game
      </BaseButton>

      <ProfileSelection @profile-loading="onLoading" />

      <GraphicsSelection @graphics-loading="onLoading" />

      <ENB @enb-loading="onLoading" />

      <Resolution @resolution-loading="onLoading" />
    </div>

    <div class="c-navigation__content l-column l-space-between">
      <div class="l-column" data-testid="navigation-container">
        <router-link
          v-slot="{ href, navigate, isActive }"
          :to="{
            name: 'Home',
          }"
          custom
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Home
          </NavigationItem>
        </router-link>

        <router-link
          v-slot="{ href, navigate, isActive }"
          :to="{
            name: 'Community',
          }"
          custom
        >
          <NavigationItem :active="isActive" :href="href" @click="navigate">
            Community
          </NavigationItem>
        </router-link>

        <router-link
          v-slot="{ href, navigate, isActive }"
          :to="{
            name: 'Advanced',
          }"
          custom
        >
          <NavigationItem
            :active="isActive"
            :href="href"
            data-testId="navigation-advanced"
            @click="navigate"
          >
            Advanced
          </NavigationItem>
        </router-link>
      </div>

      <div class="c-navigation__launcher-info" data-testid="launcher-info">
        <p class="u-text" data-testid="modpack-version">
          Modpack version: {{ modpackVersion }}
        </p>
        <LauncherVersion :version="launcherVersion" />
        <p class="u-text">
          <BaseLink
            href="https://github.com/Wildlander-mod/Launcher"
            :underline="true"
            data-testid="contribute-link"
            >Help contribute
          </BaseLink>
        </p>
      </div>
    </div>
  </nav>

  <AppModal
    :show-modal="gameRunning"
    name="gameRunning"
    data-testid="game-running-modal"
  >
    <div class="l-column l-center l-center-text">
      <div class="u-spacing">
        <template v-if="checkingPrerequisites">
          Checking if {{ modpackName }} prerequisites are installed...
        </template>
        <template v-if="installingPrerequisites">
          <div>
            <div>{{ modpackName }} prerequisites are currently installing.</div>
            <div>Please click "Install" or "Repair" on any pop ups.</div>
            <div>
              Ensure you close all pop ups that appear after installation is
              complete.
            </div>
          </div>
        </template>
        <template v-if="!checkingPrerequisites && !installingPrerequisites">
          Launching {{ modpackName }} version {{ modpackVersion }}. This is not
          an error, and launching may take several minutes.
        </template>
      </div>
    </div>
  </AppModal>

  <AppModal name="rebootModal" :show-modal="rebootRequired">
    <div class="l-column l-center l-center-text">
      <div class="u-spacing">
        A system reboot is required to complete installation.
      </div>
    </div>

    <template #action>
      <BaseButton type="primary" @click="reboot">Reboot</BaseButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppModal from "./AppModal.vue";
import BaseLink from "./BaseLink.vue";
import NavigationItem from "./NavigationItem.vue";
import BaseButton from "./BaseButton.vue";
import Resolution from "./Resolution.vue";
import ProfileSelection from "./ProfileSelection.vue";
import ENB from "./ENB.vue";
import { MOD_ORGANIZER_EVENTS } from "../../../main/controllers/modOrganizer/modOrganizer.events";
import logger from "electron-log/renderer";
import { injectStrict, SERVICE_BINDINGS } from "../services/service-container";
import { WABBAJACK_EVENTS } from "../../../main/controllers/wabbajack/wabbajack.events";
import { SYSTEM_EVENTS } from "../../../main/controllers/system/system.events";
import { LAUNCHER_EVENTS } from "../../../main/controllers/launcher/launcher.events";
import { DIALOG_EVENTS } from "../../../main/controllers/dialog/dialog.events";
import { MODPACK_EVENTS } from "../../../main/controllers/modpack/mopack.events";
import type { Modpack } from "../../../shared/types/modpack-metadata";
import LauncherVersion from "./LauncherVersion.vue";
import GraphicsSelection from "./GraphicsSelection.vue";

const ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

const gameRunning = ref(false);
const checkingPrerequisites = ref(false);
const installingPrerequisites = ref(false);
const rebootRequired = ref(false);
const isLoading = ref(false);
const launcherVersion = ref<string | null>(null);
const modpackVersion = ref<string | null>(null);
const modpackName = ref<string | null>(null);

onMounted(async () => {
  modpackVersion.value = await ipcService.invoke(
    WABBAJACK_EVENTS.GET_MODPACK_VERSION
  );

  modpackName.value = (
    await ipcService.invoke<Modpack>(MODPACK_EVENTS.GET_MODPACK_METADATA)
  ).name;

  launcherVersion.value = await getVersion();
});

async function getVersion() {
  return ipcService.invoke<string>(LAUNCHER_EVENTS.GET_VERSION);
}

async function checkPrerequisites(showMessage = true) {
  if (showMessage) {
    checkingPrerequisites.value = true;
  }
  const installed = await ipcService.invoke<boolean>(
    SYSTEM_EVENTS.CHECK_PREREQUISITES
  );
  if (showMessage) {
    checkingPrerequisites.value = false;
  }
  return installed;
}

function resetChecks() {
  installingPrerequisites.value = false;
  checkingPrerequisites.value = false;
  gameRunning.value = false;
}

async function installPrerequisites() {
  installingPrerequisites.value = true;
  await ipcService.invoke(SYSTEM_EVENTS.INSTALL_PREREQUISITES);
  const installed = await checkPrerequisites(false);
  if (!installed) {
    logger.error(`Error installing prerequisites`);
    throw new Error(
      `Program not available after successful install. Perhaps try restarting your PC.`
    );
  }
  installingPrerequisites.value = false;
}

async function launchGame() {
  logger.debug("Setting game to running");
  gameRunning.value = true;
  const installed = await checkPrerequisites();
  if (!installed) {
    try {
      await installPrerequisites();
      resetChecks();
      rebootRequired.value = true;
      return;
    } catch (error) {
      logger.error(`Error installing prerequisites: ${error}`);
      await ipcService.invoke(DIALOG_EVENTS.ERROR, {
        title: "Install failed",
        error: `Failed to install prerequisites. ${error}`,
      });
      resetChecks();
      return;
    }
  }

  await ipcService.invoke(MOD_ORGANIZER_EVENTS.LAUNCH_GAME);
  logger.debug("Setting game to no longer running");
  gameRunning.value = false;
}

function reboot() {
  ipcService.invoke(SYSTEM_EVENTS.REBOOT);
}

function onLoading(loading: boolean) {
  isLoading.value = loading;
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../assets/scss/index" as *;

.c-navigation {
  backdrop-filter: $background-blur--more;
  background: color.adjust($colour-background, $alpha: -0.8);

  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;

  width: 225px;
}

.c-navigation__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;
  padding: 30px;

  border-bottom: 1px solid $colour-background--light;

  box-sizing: border-box;

  & * {
    margin-bottom: $size-spacing;
  }

  :last-child {
    margin-bottom: 0;
  }
}

.c-navigation__content {
  width: 100%;
  padding-left: $size-spacing--x-large;
  padding-top: $size-spacing--x-large;
  padding-bottom: $size-spacing--x-large;
  flex: 1;

  box-sizing: border-box;
}

.c-navigation__launcher-info {
  font-size: $font-size;
  color: $colour-text--secondary;
}
</style>
