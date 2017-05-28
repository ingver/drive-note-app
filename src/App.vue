<template>

<div id="app">
  <user-bar class="user-bar"
    :signed-in="signedIn"
    :profile="profile"
    @sign-in="signIn"
    @sign-out="signOut">
  </user-bar>
  <list-view class="list-view"
    :list-data="currentList"
    :signedIn="signedIn"
    :atRoot="atRoot"
    :loading="loading"></list-view>
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
      currentList: null,
      config: null,
      atRoot: false,
      loading: true
    }
  },

  created() {
    console.log(Gapi)
    Gapi.loadClient()
      .then(() => {
        console.log('gapi loaded client')
      })
      .then(() => {
        // assign initial values
        this.signedIn = Gapi.isSignedIn()
        this.profile = Gapi.getUserProfile()
        // register listeners
        Gapi.listenUserStatus(this.changeStatus)
        Gapi.listenCurrentUser(this.changeProfile)

        window.addEventListener('hashchange', this.updateList.bind(this))
      })
      .catch(err => console.error('gapi couldn\'t load client:', err))
  },

  methods: {
    signIn() {
      Gapi.signIn()
        .then(user => {
          console.log('successfully signed in')
        })
        .catch(err => console.error('failed to sign in:', err))
    },

    signOut() {
      Gapi.signOut()
        .then(() => console.log('successfulle signed out'))
    },

    changeStatus(status) {
      console.log('user status changed:', status)
      this.signedIn = status
    },

    changeProfile(user) {
      console.log('current user changed:', user)
      this.profile = new Profile(user)
    },

    updateList() {
      console.log('invoked loadData...')
      if (this.signedIn) {
        console.log('fetching data...')
        this.loading = true

        console.log('hash:', window.location.hash)
        let listId = window.location.hash.slice(1)
        if (listId === '') {
          listId = this.config.appFolderId
        }
        console.log('listId:', listId)

        Gapi.getFileMetadata(
          {
            fileId: listId,
            fields: ['name', 'parents', 'trashed']
          })
          .catch(err => {
            console.error(`Cannot find folder with id ${listId}:`, err)
            throw err
          })
          .then(folder => {
            console.log('got folder:', folder)

            return {
              title: folder.name,
              parents: folder.parents,
              content: ''
            }
          })
          .then(listData => {
            return Gapi.listFiles(
              {
                q: `'${listId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
                fields: 'files(id, name, trashed, parents)'
              })
              .then(childrenResponse => {
                return {
                  listData,
                  children: childrenResponse.result.files
                }
              })
              .catch(err => {
                console.error(`Couldn't get children of list with id ${listId}:`, err)
                throw err
              })
          })
          .then(({ listData, children }) => {
            console.log('listData:', listData)
            console.log('items list:', children)
            const items = children.map(c => ({
                id: c.id,
                title: c.name
              }))

            return Object.assign(
              {},
              listData,
              { items })
          })
          .then(listData => {
            this.currentList = listData
            this.atRoot = listId === this.config.appFolderId
            this.loading = false
          })
          .catch(err => {
            console.error('failed to update the list:', err)
          })

      } else {
        console.log('not signed in')
        this.currentList = null
      }
    }
  },

  watch: {
    signedIn: function() {
      if (this.signedIn) {
        Drive.initDriveStorage()
          .catch(err => {
            console.error('failed to init Drive storage:', err)
          })
          .then(config => {
            console.log('got initialized config:', config)
            this.config = config

            if (window.location.hash === '') {
              window.location.hash = this.config.appFolderId
              console.log(window.location.hash)
            } else {
              this.updateList()
            }
          })
      } else {
        this.config = null
        this.currentList = null
      }
      //this.updateList()
    }
  }
}

</script>
