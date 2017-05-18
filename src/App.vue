<template>

<div id="app">
  <cards-list></cards-list>
</div>

</template>


<style scoped>

</style>


<script>

import CardsList from './components/CardsList.vue'

export default {
  name: 'app',
  components: {
    CardsList
  },

  data() {
    return {
      subject: 'Drive'
    }
  }
}

</script>
