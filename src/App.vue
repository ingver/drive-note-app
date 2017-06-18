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
    :list-data="currentTreeNode"
    :content="currentNodeContent"
    :signedIn="signedIn"
    :at-root="atRoot"
    :loading="loading"
    :not-found="notFound"
    :content-loading="contentLoading"
    :error="error"
    :error-msg="errorMsg"
    @update-content="updateContent"
    @update-title="updateTitle"
    @load-item="loadItem"
    @add-item="addItem"
    @remove-item="removeItem"
    @go-up="goUp">
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
import { flattenTree } from './utils.js'

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
      treeData: null,
      currentTreeNode: null,
      nodesRegister: null,
      currentNodeContent: '',
      atRoot: false,
      loading: true,
      contentLoading: false,
      notFound: false,
      error: false,
      errorMsg: ''
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

      window.onpopstate = this.onPopState

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
      window.localStorage.clear()
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
          this.treeData = listData
          this.atRoot = this.currentListId === this.config.appFolderId
          this.loading = false
        } catch(err) {
          console.error('failed to update the list:', err)
          this.notFound = true
        }
      } else {
        console.log('not signed in')
        this.treeData = null
      }
    },

    async updateTree() {
      if (this.treeData !== null) {
        window.localStorage.setItem('tree-data', JSON.stringify(this.treeData))
        console.log(`updated tree-data:`, JSON.parse(window.localStorage.getItem('tree-data')))
      }
    },

    async updateContent(id, editedContent) {
      console.log(`updating content:`, editedContent)

      const entry = this.nodesRegister[id]
      const { contentMeta = null } = entry


      if (contentMeta !== null) {
        Object.assign(contentMeta, { content: editedContent })
        this.currentNodeContent = editedContent

        try {
          await Drive.uploadContent({
            contentFileId: contentMeta.contentFileId,
            content: editedContent
          })
        } catch (err) {
          console.error('caught while trying to updload content', err)
        }
      }
    },

    async updateTitle() {
      const { id, name } = this.currentTreeNode

      try {
        await Drive.updateTitle({ listId: id, title: name })
        console.log('updated title')
        this.updateTree()
      } catch (err) {
        console.error('caugth while trying to update title:', err)
      }
    },

    async addItem() {
      console.log('adding new item')

      try {
        const newItemName = 'New Item'

        const folderResponse = await Gapi.createFolder({
          name: newItemName,
          parents: [`${this.currentTreeNode.id}`]
        })
        const folder = folderResponse.result
        console.log(`new item created:`, folder)

        const node = {
          id: folder.id,
          name: newItemName,
          items: []
        }
        this.currentTreeNode.items.push(node)

        const newEntry = {
          node,
          parent: this.currentTreeNode
        }
        this.nodesRegister[folder.id] = newEntry

        this.loadItem(folder.id)
        this.updateTree()

      } catch(err) {
        console.error('caught while trying to add new item:', err)
      }
    },

    async removeItem(id) {
      console.log('removing item', id)

      try {
        const fileMetaResponse = await Gapi.trashFile(id)
        console.log('successfully moved file to trash:', fileMetaResponse)

        const { node = null, parent = null } = this.nodesRegister[id]
        if (node !== null && parent !== null) {
          const idx = parent.items.indexOf(node)
          if (idx !== -1) {
            parent.items.splice(idx, 1)
            this.updateTree()
          }
        }

      } catch(err) {
        console.error('Caught while moving file to trash:', err)
      }
    },

    goToTop() {
      if (this.treeData !== null) {
        this.loadItem(this.treeData.id)
      }
    },

    async loadItem(id) {
      this.notFound = false
      this.currentNodeContent = ''
      console.log(`loading item ${id}`)
      const entry = this.nodesRegister[id]
      console.log(`entry:`, entry)
      const { node = null } = entry
      if (node !== null) {
        this.currentTreeNode = node
        history.pushState({ id }, id, `${id}`)
        this.atRoot = node.id === this.treeData.id

        this.loadItemContent(entry)
      } else {
        this.notFound = true
      }
    },

    async loadItemContent(entry) {
      console.log(`entry:`, entry)
      this.contentLoading = true
      if ('contentMeta' in entry) {
        console.log(`applying cashed content`, entry.contentMeta.content)
        this.currentNodeContent = entry.contentMeta.content
      } else {
        try {
          const contentMeta = await Drive.getNodeContent(entry.node.id)
          console.log(`loaded node content`, contentMeta)
          Object.assign(entry, { contentMeta })
          this.currentNodeContent = contentMeta.content
        } catch (err) {
          console.error(`caught while loading node content`, err)
          this.error = true
        }
      }
      this.contentLoading = false
    },

    async onPopState(e) {
      console.log(e)
      const entry = this.nodesRegister[e.state.id]
      const { node = null } = entry
      if (node !== null) {
        this.currentTreeNode = node
        this.atRoot = node.id === this.treeData.id
        this.loadItemContent(entry)
      }
    },

    goUp(id) {
      const { parent } = this.nodesRegister[id]
      if (parent !== null) {
        this.loadItem(parent.id)
      }
    }
  },

  watch: {
    signedIn: async function() {
      if (this.signedIn) {
        const localTreeDataJSON = window.localStorage.getItem('tree-data')

        if (localTreeDataJSON === null) {
          console.warn(`can't load local list data`)
          this.loading = true

          try {
            const config = await Drive.initDriveStorage()
            console.log('got initialized config:', config)

            const fullTree = await Drive.getFullOutline(config.appFolderId)
            this.treeData = fullTree
            window.localStorage.setItem('tree-data', JSON.stringify(fullTree))

          } catch(err) {
            console.error('failed to init Drive storage:', err)
            this.error = true
            this.errorMsg = 'Failed to load data from Google Drive. Try to reload the page.'

            return
          }
        } else {
          this.treeData = JSON.parse(localTreeDataJSON)
          console.log(`got treeData:`, this.treeData)
        }

        this.nodesRegister = flattenTree({ tree: this.treeData })
        const path = window.location.pathname.slice(1)
        this.currentTreeNode = this.treeData
        this.atRoot = true
        if (path !== '') {
          console.log(this.nodesRegister[path])
          const entry = this.nodesRegister[path]
          if (entry !== undefined) {
            const { node = null } = entry
            if (node !== null) {
              this.currentTreeNode = node
              this.atRoot = node.id === this.treeData.id

              this.loadItemContent(entry)
            }
          }
        }
        this.loading = false

        const id = this.currentTreeNode.id
        window.history.replaceState({ id }, id, `${id}`)

      } else {
        this.treeData = null
        this.currentTreeNode = null
        this.nodesRegister = null
      }
    }
  }
}

</script>
