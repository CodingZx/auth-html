const TokenKey = 'access-token'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}


const PermissionKey = 'access-permission'
export function setPermissions(permissions) {
  return localStorage.setItem(PermissionKey, JSON.stringify(permissions))
}

export function getPermissions() {
  var value = localStorage.getItem(PermissionKey)
  if(value) return JSON.parse(value)
  return []
}

export function removePermissions() {
  return localStorage.removeItem(PermissionKey)
}


export function checkPermissions(permissions) {
  var nowPermissions = getPermissions()
  if(permissions instanceof Array) {
    for(var i=0;i<permissions.length;i++) {
      var result = nowPermissions.includes(permissions[i])
      if(result) return true
    }
    return false
  }
  if(permissions instanceof String) {
    return nowPermissions.includes(permissions)
  }
  return false
}