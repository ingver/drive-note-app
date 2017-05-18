<template>

<div id="app">
  <cards-list></cards-list>
</div>

</template>


<style scoped>

</style>


<script>

import marked from 'marked'
import * as config from './config.js'
import Gapi from './gapi/gapi.js'
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
  },

  created() {
    const gapi = new Gapi(config)
    console.log('init gapi')

    gapi.loadClient()
      .then(() => {
        console.log('gapi loaded client')
      })
      .catch(err => console.error('gapi couldn\'t load client:', err))
  },

  mounted() {
    console.log(marked('I am using __markdown__.'))
  }
}

</script>
