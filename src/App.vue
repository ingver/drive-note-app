<template>

<div id="app">
  <p>Hello, {{ subject }}</p>
</div>

</template>


<style scoped>

p {
  font-family: 'Roboto', sans-serif;
  color: green;
}

</style>


<script>

export default {
  data() {
    return {
      subject: 'Drive'
    }
  }
}

</script>
