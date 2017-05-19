import Profile from './profile.js'

export default class Gapi {
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
            gapi.client.init({
              discoveryDocs: this.DISCOVERY,
              clientId: this.CLIENT_ID,
              scope: this.SCOPES.join(' ')
            }).then(() => {
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
}
