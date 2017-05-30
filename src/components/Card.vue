<template>

<a class="card"
    :style="cardStyles"
    :href="link"
    @click="changeHash(link)">
  <h3 class="title">{{ title }}</h3>
  <button class="menu-button" @click.prevent.stop="removeItem"></button>
  <div class="content">
    {{ content }}
  </div>
</a>

</template>


<style scoped>

.card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  flex-basis: 350px;
  flex-grow: 0.1;
  flex-shrink: 1;
  height: 200px;
  margin: 10px;
  padding: 10px;
  position: relative;
  border-radius: 5px;
  background-color: white;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  overflow: hidden;
  transition: all 0.3s;
  text-decoration: none;

  &::before {
    z-index: 1;
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0,0,0,0);
    transition: all 0.3s;
  }

  &:hover {
    background-size: 120%;
    box-shadow: 0 0 4px 0px rgba(0,0,0,0.3);
    transition: all 0.3s;

    &::before {
      background-color: rgba(0,0,0,0.3);
      transition: all 0.3s;
    }

    & .menu-button {
      box-shadow: 0 0 3px 1px rgba(255,255,255,0.8);
      &:hover {
        background-color: rgba(0,0,0,0.5);
        box-shadow: 0 0 3px 2px rgba(255,255,255,0.9);
      }
    }
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
    align-items: center;
  }
}

.title {
  width: 70%;
  margin: 0;
  padding: 3px 5px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-radius: 3px;
  line-height: 20px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background-image: linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 50%, rgba(0,0,0,0));
}

.menu-button {
  height: 26px;
  width: 26px;
  position: relative;
  z-index: 3;
  border: none;
  border-radius: 3px;
  outline: none;
  background-color: rgba(0,0,0,0.3);
  font-size: 0;

  &::before {
    content: '';
    display: block;
    position: absolute;
    width: 16px;
    height: 12px;
    top: 5px;
    left: 5px;
    border-top: 2px solid white;
    border-bottom: 2px solid white;
  }

  &::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 5px;
    width: 16px;
    height: 2px;
    background-color: white;
  }
}

.content {
  width: 100%;
  height: 30%;
  padding: 10px;
  position: absolute;
  z-index: 2;
  left: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  color: white;
  word-wrap: break-word;

  @media (max-width: 300px) {
    display: none;
  }

  @apply --markdown-theme;
}

</style>


<script>

import marked from 'marked'

export default {
  name: 'card',
  props: {
    id: String,
    title: String,
    content: String,
    bgImg: String
  },

  data() {
    const bg = this.bgImg === undefined ? `` : `url(${this.bgImg})`
    return {
      cardStyles: {
        backgroundImage: bg
      }
    }
  },

  computed: {
    link() {
      if (this.id !== undefined) {
        return `#${this.id}`
      }
    }
  },

  methods: {
    changeHash(link = '') {
      if (link === '') {
        return
      }
      window.location.hash = link
    },

    showMenu(e) {},

    removeItem() {
      this.$emit('remove-item', this.id)
    }
  }
}

</script>
