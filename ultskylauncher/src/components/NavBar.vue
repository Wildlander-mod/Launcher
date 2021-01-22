<template>
  <nav>
    <Button
      id="nav__launch-button"
      text="Launch Game"
      type="primary"
      size="large"
    />
    <Select
      :options="qualityOptions"
      class='nav__select'
      placeholder="None"
    />
    <Select
      :options="enbOptions"
      class='nav__select'
      placeholder="No ENB"
    />
    <hr>
    <div id="nav__tabs">
      <div
        :class="`nav__tab-highlight--${activeTab}`"
        id="nav__tab-highlight"
      />
      <router-link
        @click="activeTab = 'home'"
        :class="activeTab === 'home' ? 'nav__tab--selected' : ''"
        :to="{
          name: 'Home'
        }"
      >
        Home
      </router-link>
      <router-link
        @click="activeTab = 'enb'"
        :class="activeTab === 'enb' ? 'nav__tab--selected' : ''"
        :to="{
          name: 'ENB'
        }"
      >
        Configure ENB
      </router-link>
      <router-link
        @click="activeTab = 'resources'"
        :class="activeTab === 'resources' ? 'nav__tab--selected' : ''"
        :to="{
          name: 'Resources'
        }"
      >
        Resources
      </router-link>
      <router-link
        @click="activeTab = 'settings'"
        :class="activeTab === 'settings' ? 'nav__tab--selected' : ''"
        :to="{
          name: 'Settings'
        }"
      >
        Settings
      </router-link>
    </div>
    <div id="nav__launcher-info">
      <p>Game Version: {{ gameVersion }}</p>
      <p>Launcher Version: {{ launcherVersion }}</p>
    </div>
  </nav>
</template>

<script>
import Button from './controls/Button.vue'
import Select from './controls/Select.vue'

export default {
  name: 'Nav-Bar',
  components: {
    Button,
    Select
  },
  data () {
    return {
      activeTab: 'home',
      enbOptions: undefined,
      gameVersion: '0',
      launcherVersion: '0',
      qualityOptions: [{ name: 'Low Quality' }, { name: 'Medium Quality' }, { name: 'High Quality' }]
    }
  }
}
</script>

<style lang="scss" scoped>
nav {
  backdrop-filter: blur(20px);
  background: #e1e1e133;
  display: flex;
  flex-direction: column;
  height: 550px;
  width: 225px;

  #nav__launch-button {
    align-self: center;
    margin-top: 30px;
  }

  #nav__launcher-info {
    align-self: center;
    display: flex;
    flex-direction: column;
    margin-top: 80px;
    width: 150px;

    p {
      color: #ffffff66;
      font-size: 12px;
      line-height: 15px;
    }
  }

  #nav__tab-highlight {
    background-color: #0b32e6;
    height: 50px;
    left: 220px;
    position: absolute;
    width: 5px;
  }

  #nav__tabs {
    align-self: center;
    display: flex;
    flex-direction: column;
    width: 150px;

    a {
      color: #ffffff66;
      font-size: 18px;
      line-height: 30px;
      margin-top: 30px;
      text-decoration: none;

      &.nav__tab--selected {
        color: #ffffff;
      }
    }
  }

  .nav__select {
    align-self: center;
    margin-top: 10px;
  }

  .nav__tab-highlight {
    &--enb {
      top: 252px;
      transition: top 0.4s;
    }

    &--home {
      top: 192px;
      transition: top 0.4s;
    }

    &--resources {
      top: 312px;
      transition: top 0.4s;
    }

    &--settings {
      top: 372px;
      transition: top 0.4s;
    }
  }

  hr {
    border-color: #ffffff33;
    margin-bottom: 0px;
    margin-top: 30px;
    width: 223px;
  }
}
</style>
