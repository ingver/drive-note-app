<template>

<div id="app">
  <user-bar class="user-bar"
    :signed-in="signedIn"
    :profile="profile"
    @sign-in="signIn"
    @sign-out="signOut"
    @go-to-top="goToTop">
  </user-bar>

  <list-view class="list-view"
    :list-data="currentListData"
    :signedIn="signedIn"
    :at-root="atRoot"
    :loading="loading"
    :not-found="notFound"
    @update-content="updateContent"
    @update-title="updateTitle"
    @add-item="addItem"
    @remove-item="removeItem">
  </list-view>
</div>

</template>


<style scoped>

:root {
  --text-font: 'Source Sans Pro', Arial, sans-serif;
  --button-font: 'Roboto', Arial, sans-serif;
}

.user-bar {
  position: fixed;
  top: 0;
  z-index: 5;
}

.list-view {
  position: relative;
  top: 60px;

  @media (max-width: 700px) {
    top: 46px;
  }
}

</style>


<script>

import Gapi from './gapi/gapi.js'
import * as Drive from './gapi/drive-utils.js'
import Profile from './gapi/profile.js'
import UserBar from './components/UserBar.vue'
import ListView from './components/ListView.vue'

export default {
  name: 'app',
  components: {
    ListView,
    UserBar
  },

  data() {
    return {
      signedIn: false,
      profile: null,
      currentListId: '',
      currentListData: null,
      config: null,
      atRoot: false,
      loading: true,
      notFound: false
    }
  },

  async created() {
    console.log(Gapi)
    try {
      await Gapi.loadClient()
      console.log('gapi loaded client')
      // assign initial values
      this.signedIn = Gapi.isSignedIn()
      this.profile = Gapi.getUserProfile()
      // register listeners
      Gapi.listenUserStatus(this.changeStatus)
      Gapi.listenCurrentUser(this.changeProfile)

      window.addEventListener('hashchange', this.updateList)

    } catch(err) {
      console.error('gapi couldn\'t load client:', err)
    }
  },

  methods: {
    async signIn() {
      try {
        await Gapi.signIn()
        console.log('successfully signed in')
      } catch(err) {
        console.error('failed to sign in:', err)
      }
      this.loading = true
    },

    async signOut() {
      await Gapi.signOut()
      console.log('successfull signed out')
    },

    changeStatus(status) {
      console.log('user status changed:', status)
      this.signedIn = status
    },

    changeProfile(user) {
      console.log('current user changed:', user)
      this.profile = new Profile(user)
    },

    async updateList() {
      console.log('invoked loadData...')
      this.notFound = false
      if (this.signedIn) {
        console.log('fetching data...')
        this.loading = true

        console.log('hash:', window.location.hash)
        this.currentListId = window.location.hash.slice(1)
        if (this.currentListId === '') {
          this.currentListId = this.config.appFolderId
        }
        console.log('current list id:', this.currentListId)

        try {
          const listData = await Drive.getNode(this.currentListId)
          this.currentListData = listData
          this.atRoot = this.currentListId === this.config.appFolderId
          this.loading = false
        } catch(err) {
          console.error('failed to update the list:', err)
          this.notFound = true
        }
      } else {
        console.log('not signed in')
        this.currentListData = null
      }
    },

    updateContent() {
      const { contentFileId, content } = this.currentListData

      Drive.uploadContent({ contentFileId, content })
    },

    async updateTitle() {
      const { title } = this.currentListData

      try {
        await Drive.updateTitle({ listId: this.currentListId, title })
        console.log('updated title')
      } catch (err) {
        console.error('caugth while trying to update title:', err)
      }
    },

    async addItem() {
      console.log('adding new item')

      try {
        const folderResponse = await Gapi.createFolder({
          name: 'New Item',
          parents: [`${this.currentListId}`]
        })
        console.log(`new item created:`, folderResponse)
        const folder = folderResponse.result
        window.location.hash = folder.id
      } catch(err) {
        console.error('caught while trying to add new item:', err)
      }
    },

    async removeItem(id) {
      console.log('removing item', id)

      try {
        await Gapi.trashFile(id)
        console.log('successfully moved file to trash:', fileMetaResponse)
        this.updateList()
      } catch(err) {
        console.error('Caught while moving file to trash:', err)
      }
    },

    goToTop() {
      if (this.config !== null) {
        window.location.hash = this.config.appFolderId
      }
    }
  },

  watch: {
    signedIn: async function() {
      if (this.signedIn) {
        try {
          const config = await Drive.initDriveStorage()
          console.log('got initialized config:', config)
          this.config = config

          if (window.location.hash === '') {
            window.location.hash = this.config.appFolderId
            console.log(window.location.hash)
          } else {
            this.updateList()
          }
        } catch(err) {
          console.error('failed to init Drive storage:', err)
        }
      } else {
        this.config = null
        this.currentListData = null
      }
    }
  }
}

</script>
