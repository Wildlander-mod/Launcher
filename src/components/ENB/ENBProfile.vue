<template>
  <b-form>
    <b-form-group :label="this.$props.name">
      <b-button @click="$emit('load', name)">Load</b-button>
      <b-button @click="$emit('configure', name)">Open</b-button>
      <b-button @click="$emit('delete', name)">Delete</b-button>
      <b-form-checkbox disabled :checked="this.isActive" />
    </b-form-group>
  </b-form>
</template>

<script>
export default {
  name: 'ENBProfile',
  props: {
    name: String,
    isActive: Boolean
  }
}
</script>
