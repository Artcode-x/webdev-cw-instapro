import { USER_POSTS_PAGE } from "../routes.js"
import { renderHeaderComponent } from "./header-component.js"
import {
  userPosts,
  goToPage,
  getToken,
  user,
  newGetUserPosts,
} from "../index.js"

import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

import { addLike, delLike, getPosts, getAllPostsUser } from "../api.js"

export function renderUserPosts({ appEl }) {
  // TODO: реализовать рендер постов из api

  console.log("Актуальный список постов юзера:", userPosts)

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  const bodyPostsUser = userPosts // Все посты юзера без Фото и имени (чтобы они не дублировались)
    .map(
      (data, index) =>
        `
        <div class="page-container">
        <div class="header-container"></div>
      <div class="posts-user-header" >
        <!-- эту часть вынесли, чтобы аватарка с именем не дублировалась много раз -->
      </div>
      
      <div>
      <ul class="posts" data-user-id="${data.user.id}">
      <!-- Список рендерится из JS -->
      <li class="post" data-index=${index}>   
      <div class="post-image-container">
      <img class="post-image" src="${data.imageUrl}">
      </div>
      <div class="post-likes">
      <button data-post-id="${data.id}" class="like-button">
      ${
        data.isLiked
          ? '<img src="./assets/images/like-active.svg">'
          : '<img src="./assets/images/like-not-active.svg">'
      }
      </button>
      <p class="post-likes-text">
       <strong> ${
         data.likes.length > 1
           ? data.likes
               .map((like) => {
                 return like.name
               })
               .pop() +
             " и еще " +
             (data.likes.length - 1)
           : data.likes.length == 1
           ? data.likes
               .map((like) => {
                 return like.name
               })
               .pop()
           : "0"
       }</strong>
      </p>
      </div>
      
      <p class="post-text">
      <span class="user-name">${data.user.name}</span>
      ${data.description}
      </p>
      <p class="post-date">
      ${formatDistanceToNow(new Date(data.createdAt), {
        locale: ru, // перевод даты на ру
        addSuffix: true, // добавляет надпись "назад"
      })}
      </p>
      </li>
      <li class="post">
           </ul>
      </div>
      </div> 
              `
    )
    .join("")

  const notRepeatAvatarAndNameUser = userPosts // (avatar and name: user)
    .map((data) => {
      return `
      <img src="${data.user.imageUrl}" class="posts-user-header__user-image">
      <p class="posts-user-header__user-name">${data.user.name}</p>`
    })
    .pop() // чтобы фото с именем не дублировалось применили метод

  const appHtml = `
     <div class="page-container">
     <div class="header-container"></div>
   <div class="posts-user-header">
     ${notRepeatAvatarAndNameUser}
   </div>
   ${bodyPostsUser}
   <div>
   <ul class="posts">
   <br>
   </div>
    `

  appEl.innerHTML = appHtml
  //console.log(document.querySelector(".posts"));

  // Вдыхаем жизнь в лайки!

  const buttonLikeElements = document.querySelectorAll(".like-button")
  for (let buttonLikeElement of buttonLikeElements) {
    buttonLikeElement.addEventListener("click", () => {
      buttonLikeElement.classList.add("-loading-like") // при нажатии на кнопку добавляю класс "лоадинг лайк"
      // лайк будет активен до запуска ф-ии renderUserPosts (147)
      // classList добавляет или убирает класс
      const postID = buttonLikeElement.dataset.postId //находим в разметке post-id // id posta a ne uzera
      const index = buttonLikeElement.closest(".post").dataset.index // находим index
      const userID = document.querySelector(".posts").dataset.userId
      const id = {
        userId: userID,
      }

      if (user && userPosts[index].isLiked === false) {
        // если лайк не нажатый именно юзером, тогда применяем к нему addLike

        // обращаемся к посту на который кликнули
        // если кнопка не нажата юзером
        // тогда вызываем addLike()
        addLike({
          token: getToken(),
          postID: postID, // id поста
        })
          .then(() => {
            //  console.log(userID);
            //обновление данных локально с апи с пом-ю ф-ии getAllPostsUser

            return getAllPostsUser({ token: getToken(), id })
          })
          .then((response) => {
            newGetUserPosts(response) // перезаписываем newGetUserPosts после нажатия лайка
            return renderUserPosts({ appEl, userPosts }) // ререндер страницы конкретного юзера
          })
      } else if (user && userPosts[index].isLiked === true) {
        // если лайк уже нажат юзером, то применяем delLike
        delLike({
          // ф-ия удаления лайка
          token: getToken(),
          postID: postID,
        })
          .then(() => {
            // беру данные из апи и обновляю их локально  с пом-ю getAllPostsUser
            return getAllPostsUser({ token: getToken(), id })
          })
          .then((response) => {
            newGetUserPosts(response) // перезаписываем newGetUserPosts  после нажатия лайка
            return renderUserPosts({ appEl, userPosts })
          })
      }
    })
  }

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  })

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      })
    })
  }
}
