// Работа с юзером для сохранения авторизации через localStorage

export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user))
  // смотрим в локал хранилище браузера есть ли там user, если он там есть (внутри хр-ся логин и пасс)
  // записываем в переменную user
}

export function getUserFromLocalStorage(user) {
  try {
    return JSON.parse(window.localStorage.getItem("user"))
  } catch (error) {
    return null
  }
}

export function removeUserFromLocalStorage(user) {
  window.localStorage.removeItem("user")
}
