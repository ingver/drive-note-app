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
            setTimeout(waitGapiLoad, 100);
            console.log('waiting for gapi');
            return;
          }

          gapi.load('client:auth2', () => {

            gapi.client.init({
              discoveryDocs: this.DISCOVERY,
              clientId: this.CLIENT_ID,
              scope: this.SCOPES.join(' ')
            }).then(() => {

              //gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateStatus)
              //this.updateStatus(gapi.auth2.getAuthInstance().isSignedIn.get())

              console.log('gapi client after load:', gapi.client)
              resolve()

            }, reject)
          })

        }).bind(this)()
      })
  }
}
