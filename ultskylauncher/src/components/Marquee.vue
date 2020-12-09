<template>
  <div id="marquee">
    <div class="text-container">
      <div id="text-1">
        <p
          v-for="text in tempText"
          :key="text"
        >
          {{ text }}
        </p>
      </div>
    </div>
    <div class="text-container">
      <div id="text-2">
        <p
          v-for="text in tempText"
          :key="text"
        >
          {{ text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Marquee',
  props: {
    text: Array
  },
  data: () => {
    return {
      tempText: [
        'JU1200',
        'RingComics',
        'Liz',
        'Phin',
        'Dylan Perry',
        'Spence',
        ''
      ]
    }
  }
}
</script>

<style lang="scss">
#marquee {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;

  .text-container {
    display: inline-block;
    vertical-align: top;
    width: inherit;

    #text-1 {
      display: flex;
      justify-content: space-between;
      // animation: text-1-scroll-left 10s linear infinite;
    }

    #text-2 {
      display: flex;
      // animation: text-2-scroll-left 10s linear infinite;
      animation-delay: 5s;
    }
  }

  p {
    padding-left: 8px;
  }
}

@keyframes text-1-scroll-left {
  from {
    transform: translateX(200%);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes text-2-scroll-left {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-200%)
  }
}
</style>
