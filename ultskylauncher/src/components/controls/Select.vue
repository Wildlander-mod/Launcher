<template>
  <ul>
    <li
      @click="select"
      :data-value="selected.value || 'none'"
      id="init"
    >
      {{ selected.name || placeholder }}
    </li>
    <li
      :data-value="option.value"
      :key="option.value"
      v-for="(option) in options"
    >
      {{ option.name }}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Select',
  props: {
    options: Array,
    placeholder: String
  },
  data () {
    return {
      selected: {
        name: undefined,
        value: undefined
      }
    }
  },
  methods: {
    select (el) {
      const children = document.getElementById('init').parentElement.childNodes
      const items = [...children].filter(x =>
        x.tagName &&
        x.tagName.toLowerCase() === 'li' &&
        x.id.toLowerCase() !== 'init'
      )

      // for (const item in items) {

      // }
      console.log(items)
    }
  }
}
</script>

<style lang="scss">
ul {
  background-color: #ffffff33;
  height: 35px;
  line-height: 35px;
  size: 20px;
  width: 155px;

  li {
    &#init {
      cursor: pointer;
    }

    &:not(#init) {
      background-color: #767676;
      display: none;
      z-index: 2;
    }
  }
}
</style>
