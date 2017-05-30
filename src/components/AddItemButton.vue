<template>

<button class="add-item"
  @click="$emit('add-item')">

</button>

</template>


<style scoped>

.add-item {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-basis: 350px;
  flex-grow: 0.1;
  flex-shrink: 1;
  height: 200px;
  margin: 10px;
  padding: 10px;
  position: relative;
  top: 0px;
  border: 2px dashed rgba(0,0,0,0.3);
  border-radius: 5px;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  transition: all 0.15s;

  &::before {
    content: "+";
    display: block;
    font-size: 42px;
    font-family: 'Roboto', Arial, sans-serif;
    color: rgba(0,0,0,0.3);
  }

  &:hover {
    top: -2px;
    background-color: rgba(0,0,0,0.05);
    box-shadow: 0px 2px 2px 2px rgba(0,0,0,0.3);
  }

  @media (max-width: 900px) {
    flex-grow: 0.5;
    flex-basis: 300px;
    margin: 10px;
  }

  @media (max-width: 700px) {
    flex-grow: 0;
    flex-basis: 150px;
    margin: 5px;
  }

  @media (max-width: 300px) {
    flex-basis: 100px;
  }
}

</style>

<script>

export default {
  name: 'add-item-button'
}

</script>
