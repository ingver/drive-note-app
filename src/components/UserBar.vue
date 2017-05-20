<template>

<div class="user-bar">
  <button v-if="signedIn" class="button" @click="signOut">Sign Out</button>
  <button v-else class="button" @click="signIn">Sign In</button>
  <img v-if="signedIn" class="avatar" :src="profileImg">
</div>

</template>


<style scoped>

:root {
  --big-vp-justify: flex-start;
  --big-vp-user-bar-padding: 5px 15px;
  --med-vp-user-bar-padding: 5px 10px;
  --small-vp-justify: space-between;
  --small-vp-user-bar-padding: 5px 5px;
  --main-color: #28bb6a;
  --highlight-color: #39e687;
}

.user-bar {
  display: flex;
  flex-direction: row;
  justify-content: var(--big-vp-justify);
  align-items: center;
  width: 100%;
  height: 60px;
  padding: var(--big-vp-user-bar-padding);
  top: 0;
  background-color: var(--main-color);
  box-shadow: 0px 0px 3px 2px rgba(0,0,0,0.3);

  @media (max-width: 900px) {
    padding: var(--med-vp-user-bar-padding);
  }

  @media (max-width: 700px) {
    justify-content: var(--small-vp-justify);
    height: 46px;
    padding: var(--small-vp-user-bar-padding);
  }
}

.button {
  height: 40px;
  margin: 5px 10px;
  padding: 0px 10px;
  border: 1px solid rgba(0,0,0,0.3);
  border-radius: 3px;
  box-shadow: none;
  outline: none;
  background: transparent;
  font-size: 24px;
  line-height: 40px;
  vertical-align: middle;
  font-family: 'Roboto', Arial, sans-serif;
  text-transform: uppercase;
  color: rgba(255,255,255,0.95);
  transition: background-color 0.2s,
              border 0.2s,
              color 0.2s,
              box-shadow 0.2s;

  &:hover {
    border: 1px solid var(--highlight-color);
    box-shadow: 0px 0px 2px rgba(255,255,255,0.7);
    background-color: var(--highlight-color);
    color: white;
    transition: background-color 0.2s,
                border 0.2s,
                color 0.2s,
                box-shadow 0.2s;
  }

  @media (max-width: 700px) {
    height: 30px;
    margin: 4px 6px;
    padding: 0px 7px;
    font-size: 18px;
    line-height: 30px;
  }
}

.avatar {
  width: 40px;
  height: 40px;
  margin: 5px 10px;

  border-radius: 50%;
  background-color: #ccc;
}

</style>


<script>

import Profile from '../gapi/profile.js'

export default {
  name: 'user-bar',
  props: {
    signedIn: Boolean,
    profile: Profile
  },

  created() {
    console.log('profile of user bar:', this.profile)
  },

  updated() {
    console.log('user bar updated. profile:', this.profile)
  },

  computed: {
    profileImg() {
      if (this.profile !== null) {
        return this.profile.imageUrl
      }
      return ''
    }
  },

  methods: {
    signIn() {
      this.$emit('sign-in')
    },

    signOut() {
      this.$emit('sign-out')
    }
  }
}

</script>
