import * as config from './config.js'
import Profile from './profile.js'

function getErrorMessage(errResponse) {
  return errResponse.result.error.message
}

class Gapi {
  constructor(params) {
    const {
      CLIENT_ID = '',
      DISCOVERY = '',
      SCOPES = ''
    } = params

    if (CLIENT_ID === '' || !(typeof CLIENT_ID === 'string') ||
        DISCOVERY === '' || !(DISCOVERY instanceof Array) ||
        SCOPES === '' || !(SCOPES instanceof Array))
    {
      throw new Error('Gapi: invalid parameter(s) provided to constructor')
    }

    this.CLIENT_ID = CLIENT_ID
    this.DISCOVERY = DISCOVERY
    this.SCOPES = SCOPES
  }

  loadClient() {
    return new Promise(
      (resolve, reject) => {

        console.log('gapi before load:', gapi)

        ;(function waitGapiLoad() {
          if (gapi === undefined || !('load' in gapi)) {
            setTimeout(waitGapiLoad, 100)
            console.log('waiting for gapi')
            return
          }

          gapi.load('client:auth2', () => {
            console.log('gapi client load', gapi.client)
            gapi.client.init(
              {
                discoveryDocs: this.DISCOVERY,
                clientId: this.CLIENT_ID,
                scope: this.SCOPES.join(' ')
              })
              .then(() => {
                console.log('gapi client inited')
                resolve()
              }, reject)
          })

        }).bind(this)()
      })
  }

  signIn() {
    return new Promise(
      (resolve, reject) => {
        gapi.auth2.getAuthInstance().signIn()
          .then(resolve, reject)
      })
  }

  signOut() {
    return new Promise(
      (resolve, reject) => {
        gapi.auth2.getAuthInstance().signOut()
          .then(resolve, reject)
      })
  }

  listenUserStatus(listener) {
    gapi.auth2.getAuthInstance().isSignedIn.listen(listener)
  }

  isSignedIn() {
    return gapi.auth2.getAuthInstance().isSignedIn.get()
  }

  listenCurrentUser(listener) {
    gapi.auth2.getAuthInstance().currentUser.listen(listener)
  }

  getUserProfile() {
    return new Profile(gapi.auth2.getAuthInstance().currentUser.get())
  }

  listFiles(query) {
    return new Promise(
      (resolve, reject) => {
        gapi.client.drive.files.list(query)
          .then(response => {
            resolve(response.result.files)
          }, reject)
      })
  }

  static constructMiltipartRequestBody({ name = '', parents = '', mimeType = '', content = '' }) {
    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelim = `\r\n--${boundary}--`

    const metadata = {}

    if (mimeType !== '') {
      metadata.mimeType = mimeType
    }
    if (name !== '') {
      metadata.name = name
    }
    if (parents !== '') {
      metadata.parents = parents
    }

    const requestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelim

    const requestData = {
      params: {
        uploadType: 'multipart'
      },
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: requestBody
    }

    return requestData
  }

  uploadFile({ name, parents, mimeType, content }) {
    const requestBody = Gapi.constructMiltipartRequestBody({ name, parents, mimeType, content })

    const requestData = Object.assign(
      {},
      requestBody,
      {
        path: `/upload/drive/v3/files/`,
        method: 'POST',
      })

    return new Promise(
      (resolve, reject) => {
        gapi.client.request(requestData)
          .then(resolve, reject)
      })
  }

  updateFileContent({ id, mimeType, content }) {
    const requestBody = Gapi.constructMiltipartRequestBody({ mimeType, content })

    const requestData = Object.assign(
      {},
      requestBody,
      {
        path: `/upload/drive/v3/files/${id}`,
        method: 'PATCH',
      })

    return new Promise(
      (resolve, reject) => {
        gapi.client.request(requestData)
          .then(resolve, reject)
      })
  }

  getFileMetadata({ fileId = '', trashed = false, fields = ['id', 'name', 'trashed', 'parents'] }) {
    if (fileId === '') {
      throw new Error('fileId empty')
    }
    return new Promise(
      (resolve, reject) => {
        gapi.client.drive.files.get(
          {
            fileId,
            fields: fields.join(',')
          })
          .then(response => {
            const file = response.result
            if (file.trashed !== trashed) {
              reject(new Error(`Requested file ${ trashed ? 'NOT ' : '' }trashed`))
            }

            resolve(file)
          }, reject)
      })
  }

  updateFileMetadata({ fileId = '', metadata = null }) {
    console.log('updating file metadata: id =', fileId, ' metadata =', metadata)

    if (fileId === '') {
      return Promise.reject(new Error('fileId is empty'))
    }
    else if (metadata === null) {
      return Promise.reject(new Error('metadata is empty'))
    }

    return new Promise(
      (resolve, reject) => {
        gapi.client.drive.files.update(
          Object.assign(
            {},
            metadata,
            { fileId }))
          .then(resolve, reject)
      })
  }

  getFileContent(fileId = '') {
    if (fileId === '') {
      throw new Error('fileId is empty')
    }
    return new Promise(
      (resolve, reject) => {
        gapi.client.drive.files.get(
          {
            fileId,
            alt: 'media'
          })
          .then(resolve, reject)
      })
  }

  createFolder({ name = '', parents = '' }) {
    if (name === '') {
      return Promise.reject(new Error('name is empty'))
    }

    return new Promise(
      (resolve,reject) => {
        gapi.client.drive.files.create(
          {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents,
            fields: 'id'
          })
          .then(response => {
            console.log(`CREATED FOLDER:::::::::`, response)
            resolve(response)
          }, reject)
      })
  }

  async ensureFolderExists({ name = '', parent = '' }) {
    console.log(`Ensuring '${name}' folder exists`)

    let query = `name = '${name}'`
    if (parent !== '') {
      query = query + ` and '${parent}' in parents`
    }
    query = query + ` and trashed = false`
    const fields = ['id', 'name', 'parents', 'trashed']

    try {
      const folderList = await this.listFiles({
        q: query,
        fields: `files(${fields.join(',')})`
      })

      /* if no folder found, than create one */
      if (folderList.length === 0) {
        console.warn(`No '${name}' folders found`)
        return this.createFolder(
          {
            name,
            parents: [parent]
          })
          .then(newFolder => newFolder.result)
      }

      /* otherwise take first */
      return folderList[0]

    } catch (err) {
      console.error('caught error in ensureFolderExists:', err)
      throw err
    }
  }

  trashFile(fileId) {
    console.log('moving file', fileId, 'to trash')

    return this.updateFileMetadata(
      {
        fileId,
        metadata: {
          trashed: true
        }
      })
  }
}

export default new Gapi(config)
