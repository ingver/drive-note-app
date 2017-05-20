<template>

<div id="app">
  <user-bar class="user-bar"
    :signed-in="signedIn"
    :profile="profile"
    @sign-in="signIn"
    @sign-out="signOut">
  </user-bar>
  <cards-list class="cards-list"
    :list-data="currentList"></cards-list>
</div>

</template>


<style scoped>

#app {
  height: 100vh;
  background-color: #f0f0f0;
}

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
      profile: null,
      currentList: {
        bgImg: 'http://unsplash.com/photos/ima2rtH8rr4/download',
        title: 'List Title',
        content: 'The *description* of a **List** will be here',
        items: [{
          id: 1,
          bgImg: 'https://images.unsplash.com/photo-1473874629247-1bc73eda6f98?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=0765dd6291bdca493cb34ebb22338707',
          title: 'Alpinism',
          content: 'Short content of a card'
        }, {
          id: 2,
          bgImg: 'https://images.unsplash.com/photo-1475474369946-72bb667aae19?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=1101d276fa2a1e5db7742f591d0fdcc2',
          title: 'Recipes',
          content: 'Short content of a card'
        }, {
          id: 3,
          bgImg: 'https://images.unsplash.com/photo-1432836689000-d6a3632db7ab?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=5df91ad84730a5e71a4f329ef6e541f1',
          title: 'Architecture',
          content: 'Short content of a card'
        }, {
          id: 4,
          bgImg: 'https://media.giphy.com/media/xUA7bhI09WU14GI6kg/giphy.gif',
          title: 'Pictures',
          content: 'Short content of a card'
        }, {
          id: 5,
          bgImg: 'http://www.bestprintingonline.com/help_resources/Image/Ducky_Head_Web_Low-Res.jpg',
          title: 'Ducks',
          content: 'Short content of a card'
        }]
      }
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

  methods: {
    signIn() {
      this.gapi.signIn()
        .then(user => {
          console.log('successfully signed in')
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
