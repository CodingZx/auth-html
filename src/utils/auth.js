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
