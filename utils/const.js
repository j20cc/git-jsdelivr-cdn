export const top_path = "images"
export const app_name = "图床机"
export const app_description = "把你的 github 仓库变成免费图床"

const vip_users = {
  "j20cc": "2024-08-24",
  "AboutSange": "2024-08-25",
  "cyub": "2024-08-28",
}

export function isVipUser(name) {
  const expire_date = vip_users[name]
  if (!expire_date) {
    return false
  }

  const now = new Date()
  const expire = new Date(expire_date)
  if (now > expire) {
    return false
  }

  return expire_date
}
