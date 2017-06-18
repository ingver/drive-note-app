export function flattenTree({ tree = null, parent = null }) {
  if (tree === null) {
    throw new Error(`flattenTree: 'tree' and 'register' must not be null`)
  }

  const register = {
    [tree.id]: {
      node: tree,
      parent
    }
  }

  if ('items' in tree) {
    tree.items.forEach(child => {
      const childRegister = flattenTree({
        tree: child,
        parent: tree,
      })

      Object.assign(register, childRegister)
    })
  }

  return register
}
