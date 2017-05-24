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
      currentList: null,
      config: null
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

    ensureAppFolderExists() {
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

      return driveNoteFolderPromise
    },

    initDriveStorage() {
      console.log('initializing drive storage')

      // check for app config file existence
      const configPromise = this.gapi.listFiles(
        {
          q: `name = 'config.json' and 'appDataFolder' in parents`,
          spaces: 'appDataFolder',
          fields: 'files(id,name,parents)',
        })
        .then(response => {
          /*
           * if no config file, create one
           */
          const files = response.result.files
          if (files.length === 0) {
            console.warn('config file not found')

            const appFolderPromise = this.ensureAppFolderExists()
              .catch(err => {
                console.error('caught from appFolderPromise:', err)
                throw err
              })
            /*
             * create config file
             */
            const configContentPromise = appFolderPromise.then(appFolder => {
                const parentId = appFolder.id
                console.log('Chosen `driveNoteFolder` folder ID:', parentId)
                const configContent =  {
                  appFolderId: parentId
                }
                return this.gapi.uploadFile(
                  {
                    name: 'config.json',
                    mimeType: 'application/json',
                    parents: ['appDataFolder'],
                    content: JSON.stringify(configContent),
                  })
                  .then(configFileResource => {
                    return {
                      config: configContent,
                      configFileId: configFileResource
                    }
                  })
              })
              .catch(err => {
                console.error('caught from configPromise', err)
                throw err
              })

            return configContentPromise;
          }

          /*
           * get config contents
           */
          const configFile = files[0]
          return this.gapi.getFileContent(configFile.id)
            .then(response => {
              console.log('file content request result:', response.result)
              return { config: response.result, configFileId: configFile.id }
            })
        })
        .then(({ config, configFileId }) => {
          console.log('got config', config)
          return this.gapi.getFile(
            {
              fileId: config.appFolderId,
              trashed: false
            })
            .then(() => {
              console.log('config is valid')
              return config
            })
            .catch(err => {
              console.error('config is invalid: ', err)
              /*
               * create app folder
               */
              const appFolderPromise = this.ensureAppFolderExists()

              /*
               * update config
               */
              const newConfigPromise = appFolderPromise.then(appFolder => {
                  const newConfig = {
                    appFolderId: appFolder.id
                  }
                  return this.gapi.updateFileContent(
                    {
                      id: configFileId,
                      name: 'config.json',
                      parents: ['appDataFolder'],
                      mimeType: 'application/json',
                      content: JSON.stringify(newConfig)
                    })
                    .then(() => newConfig)
                })
                .catch(err => {
                  console.error('failed to update config:', err)
                  throw err
                })

              return newConfigPromise
            })
        })
        .catch(err => console.error('caught while searching config file:', err))

        return configPromise
    }
  },

  watch: {
    signedIn: function() {
      if (this.signedIn) {
        this.initDriveStorage()
          .then(config => {
            console.log('got initialized config:', config)
            this.config = config
          })
          .catch(err => {
            console.error('failed to init Drive storage:', err)
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
