<template>

<div id="app">
  <user-bar class="user-bar"
    :signed-in="signedIn"
    :profile="profile"
    @sign-in="signIn"
    @sign-out="signOut">
  </user-bar>
  <cards-list class="cards-list"></cards-list>
</div>

</template>


<style scoped>

.user-bar {
  position: fixed;
  top: 0;
  z-index: 5;
}

.cards-list {
  position: relative;
  top: 60px;

  @media (max-width: 700px) {
    top: 46px;
  }
}

</style>


<script>

import marked from 'marked'
import * as config from './config.js'
import Gapi from './gapi/gapi.js'
import Profile from './gapi/profile.js'
import UserBar from './components/UserBar.vue'
import CardsList from './components/CardsList.vue'

export default {
  name: 'app',
  components: {
    CardsList,
    UserBar
  },

  data() {
    return {
      signedIn: false,
      gapi: new Gapi(config),
      profile: null
    }
  },

  created() {
    this.gapi.loadClient()
      .then(() => {
        console.log('gapi loaded client')
      })
      .then(() => {
        const changeStatus = status => {
            console.log('user status changed:', status)
            this.signedIn = status
        }
        const changeProfile = user => {
            console.log('current user changed:', user)
            this.profile = new Profile(user)
        }
        // assign initial values
        this.signedIn = this.gapi.isSignedIn()
        this.profile = this.gapi.getUserProfile()
        // register listeners
        this.gapi.listenUserStatus(changeStatus)
        this.gapi.listenCurrentUser(changeProfile)
      })
      .catch(err => console.error('gapi couldn\'t load client:', err))
  },

  mounted() {
    console.log(marked('I am using __markdown__.'))
  },

  methods: {
    signIn() {
      this.gapi.signIn()
        .then(user => {
          console.log('successfully signed in')
          //this.profile = user.getBasicProfile()
        })
        .catch(err => console.error('failed to sign in:', err))
    },

    signOut() {
      this.gapi.signOut()
        .then(() => console.log('successfulle signed out'))
    }
  }
}

</script>
