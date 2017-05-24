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
    :signedIn="signedIn"></list-view>
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

import * as config from './config.js'
import Gapi from './gapi/gapi.js'
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
      gapi: new Gapi(config),
      profile: null,
      currentList: null
    }
  },

  created() {
    this.gapi.loadClient()
      .then(() => {
        console.log('gapi loaded client')
      })
      .then(() => {
        // assign initial values
        this.signedIn = this.gapi.isSignedIn()
        this.profile = this.gapi.getUserProfile()
        this.updateList()
        // register listeners
        this.gapi.listenUserStatus(this.changeStatus)
        this.gapi.listenCurrentUser(this.changeProfile)
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
        console.log('Loading some data...')
      } else {
        console.log('not signed in')
        this.currentList = null
      }
    },

    initDriveStorage() {
      console.log('initializing drive storage')

      // check for app config file existence
      return this.gapi.listFiles(
        {
          q: `name = 'config.json' and 'appDataFolder' in parents`,
          spaces: 'appDataFolder',
          fields: 'files(id,name,parents)',
        })
        .then(response => {
          /*
           * if no config file, create one
           */
          if (response.result.files.length === 0) {
            console.warn('config file not found')
            /*
             * find `Apps` folder
             */
            const appsFolderPromise = this.gapi.ensureFolderExists(
              {
                name: 'Apps',
                parent: 'root'
              })
              .catch(err => {
                console.error('caught from appsFolderPromise', err)
                throw err
              })

            /*
             * find `drive-note-app` folder
             */
            const driveNoteFolderPromise = appsFolderPromise.then(appsFolder => {
                const parentId = appsFolder.id
                console.log('Chosen `Apps` folder ID:', parentId)
                return this.gapi.ensureFolderExists(
                  {
                    name: 'drive-note-app',
                    parent: parentId
                  })
              })
              .catch(err => {
                console.error('caught from driveNoteFolderPromise', err)
                throw err
              })

            /*
             * create config file
             */
            const configPromise = driveNoteFolderPromise.then(driveNoteFolder => {
                const parentId = driveNoteFolder.id
                console.log('Chosen `driveNoteFolder` folder ID:', parentId)
                return this.gapi.createFile(
                  {
                    name: 'config.json',
                    mimeType: 'application/json',
                    parents: ['appDataFolder'],
                    content: `{ "appFolderId": "${parentId}" }`,
                    fields: 'id, kind, mimeType, name, parents'
                  })
                  .then(response => response.result)
              })
              .catch(err => {
                console.error('caught from configPromise', err)
                throw err
              })

            return configPromise;
          }
          return response.result.files[0]
        })
        .then(result => {
          console.log('result (config.json):', result)
          this.gapi.getFileContent(result.id)
            .then(response => {
              console.log('file content request result:', response.result)
            })
        })
        .catch(err => console.error('caught while searching config file:', err))
    }
  },

  watch: {
    signedIn: function() {
      if (this.signedIn) {
        this.initDriveStorage()
      }
      //this.updateList()
    }
  }
}

</script>
