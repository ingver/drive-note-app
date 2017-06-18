import Gapi from './gapi.js'

export async function ensureAppFolderExists() {
  try {
    /*
     * find `Apps` folder
     */
    const appsFolder = await Gapi.ensureFolderExists({
      name: 'Apps',
      parent: 'root'
    })

    /*
     * find `drive-note-app` folder
     */
    const parentId = appsFolder.id
    console.log('Chosen `Apps` folder ID:', parentId)

    const driveNoteFolder = await Gapi.ensureFolderExists({
      name: 'drive-note-app',
      parent: parentId
    })

    return driveNoteFolder

  } catch (err) {
    console.error(`caught in 'ensureAppFolderExists'`)
    throw err
  }
}

export async function initDriveStorage() {
  console.log('initializing drive storage')

  try {
    /*
     * check for app config file existence
     */
    const files = await Gapi.listFiles({
      q: `name = 'config.json' and 'appDataFolder' in parents`,
      spaces: 'appDataFolder',
      fields: 'files(id,name,parents)',
    })

    /*
     * if no config file, create one
     */
    if (files.length === 0) {
      console.warn('config file not found')

      const appFolder = await ensureAppFolderExists()

      /*
       * create config file
       */
      const parentId = appFolder.id
      console.log('Chosen `driveNoteFolder` folder ID:', parentId)

      const configContent =  {
        appFolderId: parentId
      }

      const configFileResource = await Gapi.uploadFile({
        name: 'config.json',
        mimeType: 'application/json',
        parents: ['appDataFolder'],
        content: JSON.stringify(configContent),
      })

      return configContent;
    }

    /*
     * get config contents
     */
    const configFileMeta = files[0]
    const contentResponse = await Gapi.getFileContent(configFileMeta.id)
    console.log('file content request result:', contentResponse)

    const config = contentResponse.result

    /*
     * check if appFolder exists
     */
    try {
      await Gapi.getFileMetadata({
        fileId: config.appFolderId,
      })
    } catch (err) {
      console.error('config is invalid: ', err)

      /*
       * create app folder
       */
      const appFolder = await ensureAppFolderExists()

      /*
       * update config
       */
      const newConfig = {
        appFolderId: appFolder.id
      }

      await Gapi.updateFileContent({
        id: configFileMeta.id,
        name: 'config.json',
        parents: ['appDataFolder'],
        mimeType: 'application/json',
        content: JSON.stringify(newConfig)
      })

      return newConfig
    }

    console.log('config is valid')
    return config

  } catch (err) {
    console.error(`caught while initializing Drive storage`, err)
    throw err
  }
}

export async function uploadContent({ contentFileId = '', content = '' }) {
  if (contentFileId === '') {
    throw new Error(`contentFileId is empty`)
  }

  return await Gapi.updateFileContent({
    id: contentFileId,
    mimeType: 'text/markdown',
    content
  })
}

export async function updateTitle({ listId = '', title = '' }) {
  if (listId === '') {
    throw new Error('listId is empty')
  } else if (title === '') {
    throw new Error('title is empty')
  }

  try {
    const fileResponse = await Gapi.updateFileMetadata({
      fileId: listId,
      metadata: {
        name: title
      }
    })
    console.log('updated file:', fileResponse)
  } catch(err) {
    console.error('caught while updating node title:', err)
  }
}

export async function getNode(listId = '') {
  if (listId === '') {
    throw new Error('getNode: listId is empty')
  }

  const folder = await getNodeMetadata(listId)
  console.log('got folder:', folder)

  /*
   * Save node metadata
   */
  const listData = {
    title: folder.name,
  }

  /*
   * Get node content
   */
  try {
    const nodeContent = await getNodeContent(listId)
    Object.assign(listData, nodeContent)
  } catch (err) {
    console.error('failed to get node content:', err)
    throw err
  }

  const children = await getNodeChildren(listId)

  console.log('listData:', listData)
  console.log('items list:', children)

  /*
   * Load children contents
   */
  const items = await Promise.all(
    children.map(async (c) => {
      const meta = {
        id: c.id,
        title: c.name
      }

      let content
      try {
        content = await getNodeContent(c.id)
      } catch (err) {
        console.error('failed to get content of node', c.id)
        return meta
      }

      return Object.assign(
        {},
        content,
        meta)
    })
  )
  console.log('got children', items)

  return Object.assign(
    {},
    listData,
    { items })
}

export async function getNodeMetadata(listId = '') {
  if (listId === '') {
    throw new Error('getNodeMetadata: listId is empty')
  }

  /*
   * Get list node metadata
   */
  try {
    const { id, name } = await Gapi.getFileMetadata({
      fileId: listId,
    })

    return { id, name }
  } catch (err) {
    console.error(`Cannot find folder with id ${listId}:`, err)
    throw err
  }
}

export async function getNodeChildren(listId = '') {
  if (listId === '') {
    throw new Error('getNodeChildren: listId is empty')
  }

  /*
   * Get list of child nodes
   */
  let children
  try {
    return await Gapi.listFiles({
      q: `'${listId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, trashed, parents)'
    })
  } catch (err) {
    console.error(`Couldn't get children of list with id ${listId}:`, err)
    throw err
  }
}

export async function getNodeContent(listId = '') {
  if (listId === '') {
    throw new Error('getNodeContent: listId is empty')
  }

  try {
    /*
     * Search for node content
     */
    const files = await Gapi.listFiles({
      q: `name = '.content.md' and '${listId}' in parents and trashed = false`,
      pageSize: 1,
      fields: `files(id)`
    })
    console.log('got node content', files)
    const contentFileMeta = files.length > 0 ? files[0] : null

    /*
     * Download node content
     */
    if (contentFileMeta === null) {
      console.warn(`Missing content file meta`)
      const newContentFileMeta = await Gapi.uploadFile({
        name: '.content.md',
        parents: [`${listId}`],
        mimeType: 'text/markdown'
      })
      console.log(`new content file meta:`, newContentFileMeta)

      return {
        content: '',
        contentFileId: newContentFileMeta.result.id
      }

    } else {
      const contentResponse = await Gapi.getFileContent(contentFileMeta.id)

      return {
        content: contentResponse.body,
        contentFileId: contentFileMeta.id
      }
    }

  } catch(err) {
    console.error(`Couldn't load list content:`, err)
    throw err
  }
}

export async function getFullOutline(rootId = '') {
  if (rootId === '') {
    throw new Error('getFullOutline: rootId is empty')
  }

  const root = await getNodeMetadata(rootId)

  const childrenList = await getNodeChildren(rootId)

  const fullChildren = await Promise.all(
    childrenList.map(async (c) => {
      return await getFullOutline(c.id)
    })
  )

  return Object.assign(
    {},
    root,
    { items: fullChildren })
}
