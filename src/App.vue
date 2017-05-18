<template>

<div id="app">
  <p>Hello, <span>{{ subject }}</span></p>
</div>

</template>


<style scoped>

p {
  & span {
    color: purple;
    @media (max-width: 900px) {
      font-family: Courier New, monospace;
      color: red;
    }
  }
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
