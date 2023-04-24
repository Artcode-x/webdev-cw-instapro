import { getAllPostsUser, getPosts, sendRequestToApi } from "./api.js"
import { renderAddPostPageComponent } from "./components/add-post-page-component.js"
import { renderAuthPageComponent } from "./components/auth-page-component.js"
import {
  ADD_POSTS_PAGE, // страница добавления поста
  AUTH_PAGE, // страница авторизации
  LOADING_PAGE, // страница загрузки
  POSTS_PAGE, // страница с постами всех юзеров
  USER_POSTS_PAGE, // страница с постами конкретного юзера
} from "./routes.js"
import { renderUserPosts } from "./components/user-posts-page.js"
import { renderPostsPageComponent } from "./components/posts-page-component.js"
import { renderLoadingPageComponent } from "./components/loading-page-component.js"
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js"

export let user = getUserFromLocalStorage()
export let page = null
export let posts = []
export let userPosts = []

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined
  return token
}

export const logout = () => {
  user = null
  removeUserFromLocalStorage()
  goToPage(POSTS_PAGE)
}

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE, // стр постов
      AUTH_PAGE, // стр авторизации
      ADD_POSTS_PAGE, // стр добавления поста
      USER_POSTS_PAGE, // стр юзер постов
      LOADING_PAGE, // стр загрузки
    ].includes(newPage) // Если одна из страниц выше, включает newPage - выполняем какую то логику ниже:
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если новая страница, это стр-ца добавления поста,то
      // Проверяем если user указан, то в page присваивается add_post_page, а если user не указан, то auth_page.

      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE // условие ? выражение1(выпол-ся если усл-ие истинно) : выражение2(вып-ся если усл-ие ложно)
      return renderApp()
    }

    if (newPage === POSTS_PAGE) {
      // отдельная обработка открытия этих страниц
      page = LOADING_PAGE
      renderApp()

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE
          posts = newPosts
          renderApp()
        })
        .catch((error) => {
          console.error(error)
          goToPage(POSTS_PAGE)
        })
    }

    if (newPage === USER_POSTS_PAGE) {
      // отдельная обработка открытия этих страниц
      // TODO: реализовать получение постов юзера из API
      console.log("Открываю страницу пользователя: ", data.userId)
      page = LOADING_PAGE // сначала загрузка перед появлением самой стр-цы

      renderApp()

      return getAllPostsUser({
        id: data,
        token: getToken(),
      })
        .then((newPostsUser) => {
          page = USER_POSTS_PAGE
          userPosts = newPostsUser
          // console.log(userPosts);
          renderApp()
        })
        .catch((error) => {
          console.error(error)
          goToPage(USER_POSTS_PAGE)
        })

      // return renderApp();
    }

    page = newPage // для всех остальных страниц - просто в page записываем новое значение и рендерим приложение
    renderApp()

    return
  }

  throw new Error("страницы не существует") // Если newPage - не одна из этих страниц, то вызываем ошибку. Ничего более не происходит
}

const renderApp = () => {
  const appEl = document.getElementById("app") // получаем тут div с id-"app" из index.html
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    })
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser
        saveUserToLocalStorage(user)
        goToPage(POSTS_PAGE)
      },
      user,
      goToPage,
    })
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // Принимаем данные из callback ф-ии, со стр-цы add-post-page
        // Далее передаем их в ф-ию sendRequestToApi
        // TODO: реализовать добавление поста в API
        console.log({ imageUrl })

        //Реализуем ф-ию отправки данных в апи со страницы добавления постов
        return sendRequestToApi({
          description,
          imageUrl: imageUrl,
          token: getToken(),
        }).then(() => {
          goToPage(POSTS_PAGE)
        })
        // console.log("Добавляю пост...", { description, imageUrl });
      },
    })
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    })
  }

  if (page === USER_POSTS_PAGE) {
    // TODO: реализовать страницу фотографию пользвателя
    // appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    return renderUserPosts({
      // return renderPostsPageComponent({
      appEl,
    })
  }
}

export function newGetUserPosts(param) {
  // это ф-ия нужна для перезаписи локальных данных лайков
  userPosts = param
}

export function newGetPosts(param) {
  posts = param
}
// вызывается Функция которая открывает страницу с постами, с нее начинается работа приложения
goToPage(POSTS_PAGE)
