import { getPermissions } from '@/utils/auth'
function checkPermission(el, binding) {
  const { value } = binding

  const permissions = getPermissions()

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const permissionCodes = value
      const hasPermission = permissions.some((code) => {
        return permissionCodes.includes(code)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['permissionCode']"`)
  }
}

//vue2和vue3中指令对比https://jishuin.proginn.com/p/763bfbd29cb7
export default {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  componentUpdated(el, binding) {
    checkPermission(el, binding)
  }
}
