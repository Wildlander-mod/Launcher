<template>
  <BaseDropdown
    v-if="graphics !== null && selectedGraphics !== null"
    :current-selection="selectedGraphics"
    :options="graphics"
    :grow="true"
    :show-tooltip-on-hover="true"
    data-testid="graphics-dropdown"
    @selected="onGraphicsSelected"
  >
    Uses CPU and GPU. Determines the draw distance and quality of objects,
    lighting, shadows, and grass.
  </BaseDropdown>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, {
  SelectOption,
} from "@/renderer/components/BaseDropdown.vue";
import type { FriendlyDirectoryMap } from "@/shared/types/modpack-metadata";
import { logger } from "@/main/logger";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { GRAPHICS_EVENTS } from "@/main/controllers/graphics/graphics.events";

@Options({
  components: { BaseDropdown },
  emits: ["graphics-loading"],
})
export default class GraphicsSelection extends Vue {
  selectedGraphics: SelectOption | null = null;
  graphics: SelectOption[] | null = null;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  override async created() {
    this.graphics = await this.getGraphics();
    this.selectedGraphics =
      (await this.getInitialGraphics(this.graphics)) ?? null;
  }

  async onGraphicsSelected(option: SelectOption) {
    logger.debug(`User selected graphics ${option.value}`);

    this.$emit("graphics-loading", true);

    await this.ipcService.invoke(GRAPHICS_EVENTS.SET_GRAPHICS, option.value);
    this.selectedGraphics = option;

    this.$emit("graphics-loading", false);
  }

  async getInitialGraphics(graphics: SelectOption[]) {
    const graphicsPreference = await this.ipcService.invoke(
      GRAPHICS_EVENTS.GET_GRAPHICS_PREFERENCE
    );

    return (
      graphics.find((selection) => selection.value === graphicsPreference) ??
      graphics[0]
    );
  }

  async getGraphics() {
    return (
      (await this.ipcService.invoke(
        GRAPHICS_EVENTS.GET_GRAPHICS
      )) as FriendlyDirectoryMap[]
    ).map(({ friendly, real }) => ({
      text: friendly,
      value: real,
    }));
  }
}
</script>
