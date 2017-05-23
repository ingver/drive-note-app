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
      this.gapi.listFiles({
        q: `name = 'config.json' and 'appDataFolder' in parents`,
        spaces: 'appDataFolder',
        fields: 'files(id,name,parents)',
      }).then(response => {
        console.log('response for config.json', response.result)
        console.log('response.result.files.length', response.result.files.length)

        /*
         * no config file, create one
         */
        if (response.result.files.length === 0) {

          /*
           * find `Apps` folder
           */
          return this.gapi.listFiles({
            q: `name = 'Apps' and 'root' in parents`,
            fields: 'files(id,name,parents,trashed)'
          }).then(listOfAppsFolders => {
            const files = listOfAppsFolders.result.files
            console.log('list of Apps folders:', files)

            let i = 0
            for (; i < files.length; ++i) {
              if (!files[i].trashed) {
                break
              }
            }

            // if no folder found, than create it
            if (files.length === 0 || i === files.length) {
              if (files.length === 0) {
                console.log('No `App` folders')
              } else {
                console.log('no not-trashed `Apps` folders')
              }
              return this.gapi.createFolder({ name: 'Apps' })
                .then(newFolder => newFolder.result)
            }

            // return found `Apps` folder otherwise
            return files[i]

          }).then(appsFolder => {
            const { id } = appsFolder
            console.log('Chosen Apps folder ID:', id)

            /*
             * find `drive-note-app` folder
             */
            return this.gapi.listFiles({
              q: `name = 'drive-note-app' and '${id}' in parents`,
              fields: 'files(id, name, parents, trashed)'
            }).then(list => ({list, id}))

          }).then(({list, id}) => {
            const files = list.result.files
            console.log('list of drive-note-app folders inside Apps:', files)

            let i = 0
            for (; i < files.length; ++i) {
              if (!files[i].trashed) {
                break
              }
            }

            // if no folder found, than create it
            if (files.length === 0 || i === files.length) {
              if (files.length === 0) {
                console.log('No `drive-note-app` folders')
              } else {
                console.log('no not-trashed `drive-note-app` folders')
              }
              return this.gapi.createFolder({
                name: 'drive-note-app',
                parents: [ id ]
              }).then(newFolder => newFolder.result)
            }

            // return found `drive-note-app` folder otherwise
            return files[i]

          }).then(driveNoteAppFolder => {
            const { id } = driveNoteAppFolder
            console.log('Chosen `drive-note-app` folder ID:', id)
            /*
             * find `drive-note-app` folder
             */
            return this.gapi.listFiles({
              q: `name = 'drive-note-app' and '${id}' in parents`
            }).then(list => ({list, id}))
          }).then(({ list, id }) => {
            const files = list.result.files
            console.log('list of files in drive-note-app:', files)

            /*
             * create config file
             */
            return this.gapi.createFile({
                name: 'config.json',
                mimeType: 'application/json',
                parents: ['appDataFolder'],
                content: `{ "appFolderId": "${id}" }`,
                fields: 'id, kind, mimeType, name, parents'
              }).then(response => response.result)
          })
        }
        return response.result
      }).then(result => {
        console.log('result (config.json):', result)

      }).catch(err => console.error)
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
