import Gapi from './gapi.js'

export function ensureAppFolderExists() {
  /*
   * find `Apps` folder
   */
  const appsFolderPromise = Gapi.ensureFolderExists(
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
      return Gapi.ensureFolderExists(
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
}

export function initDriveStorage() {
  console.log('initializing drive storage')

  // check for app config file existence
  const configPromise = Gapi.listFiles(
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

        const appFolderPromise = ensureAppFolderExists()
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
            return Gapi.uploadFile(
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
      return Gapi.getFileContent(configFile.id)
        .then(response => {
          console.log('file content request result:', response.result)
          return { config: response.result, configFileId: configFile.id }
        })
    })
    .then(({ config, configFileId }) => {
      console.log('got config', config)
      return Gapi.getFileMetadata(
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
          const appFolderPromise = ensureAppFolderExists()

          /*
           * update config
           */
          const newConfigPromise = appFolderPromise.then(appFolder => {
              const newConfig = {
                appFolderId: appFolder.id
              }
              return Gapi.updateFileContent(
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
