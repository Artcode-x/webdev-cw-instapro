import { USER_POSTS_PAGE } from "../routes.js"
import { renderHeaderComponent } from "./header-component.js"
import { posts, goToPage, user, getToken, newGetPosts } from "../index.js"

import { formatDistanceToNow } from "date-fns"
import { el, ru } from "date-fns/locale"

import { addLike, delLike, getPosts, deletePost } from "../api.js"

export function renderPostsPageComponent({ appEl }) {
  // TODO: реализовать рендер постов из api

  console.log("Актуальный список постов:", posts)

  const appHtml = posts
    .map(
      (elementsOfdata, index) =>
        `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  <li class="post" data-index=${index}>
                    <div class="post-header" data-user-id="${
                      elementsOfdata.user.id
                    }">
                        <img src="${
                          elementsOfdata.user.imageUrl
                        }" class="post-header__user-image">  <!-- тут меняем аватарку юзера -->
                        <p class="post-header__user-name">${
                          elementsOfdata.user.name
                        }</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src="${elementsOfdata.imageUrl}">
                    </div>
                    <div class="post-likes">
                    <div class="withButtonDel">
                      <button data-post-id="${
                        elementsOfdata.id
                      }" class="like-button">
                      ${
                        elementsOfdata.isLiked
                          ? '<img src="./assets/images/like-active.svg">'
                          : '<img src="./assets/images/like-not-active.svg">'
                      }
                      </button>
                      <p class="post-likes-text">
                        Нравится: <strong>  ${
                          elementsOfdata.likes.length > 1 //  кол-во лайков > 1 ?
                            ? // если да, то перебираем каждый лайк и отображаем имя последнего человека
                              elementsOfdata.likes
                                .map((like) => {
                                  // перебираем
                                  return like.name // отображаем имя
                                })
                                .pop() + // имя последнего человека кто лайкнул
                              " и еще " + // нравится / и еще кому то
                              (elementsOfdata.likes.length - 1) // (всего 4 лайка, но отображается нр-ся екатерине и еще 3 людям) (3) ( всего в массиве 4 эл-та начиная с 0)
                            : elementsOfdata.likes.length === 1 // если кол-во лайков = 1, то отображается кто лайкнул
                            ? elementsOfdata.likes.map((like) => {
                                return like.name
                              })
                            : "0"
                        } </strong>
                      </p>
                      </div>
                      <div class="delPost">
                      <button class="butdelPost"> Удалить </button>
                      </div>
                    </div>
                 
                    <p class="post-text">
                      <span class="user-name">${elementsOfdata.user.name}</span>
                      ${elementsOfdata.description}
                    </p>
                    <p class="post-date">
                      ${formatDistanceToNow(
                        new Date(elementsOfdata.createdAt),
                        {
                          locale: ru,
                          addSuffix: true,
                        }
                      )}
                    </p>
       
                    </li>
                </ul>
              </div>`
    )
    .join("")

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  appEl.innerHTML = appHtml

  //  ф-ия удаления постов
  function deletePosts() {
    const buttonDelElements = document.querySelectorAll(".delPost")

    for (let buttonDelElement of buttonDelElements) {
      buttonDelElement.addEventListener("click", (event) => {
        event.stopPropagation()

        const index = buttonDelElement.closest(".post").dataset.index // находим index - номер конкретного поста(как в массиве)
        const id = posts[index].id // обращение ко всем постам, номеру конкретного поста, его id // id posta
        console.log(id) // чекаем выводится ли нужный id
        deletePost({ token: getToken(), id }) // вызываем ф-ию удаления из api
          .then(() => {
            return getPosts({ token: getToken(), id }) // вызываем ф-ию получения всех постов с api, передаем token и id в нее
          })
          .then((response) => {
            newGetPosts(response) // перезаписываем newGetPosts (ф-ия нах-ся в index.js) после нажатия кнопки удалить
            // после вызова newGetPosts - отобразится список оставшихся постов после удаления (обновится)
            return renderPostsPageComponent({ appEl, posts }) // ререндер страницы постов
          })
      })
    }
  }
  deletePosts()

  function liveLikes() {
    const buttonLikeElements = document.querySelectorAll(".like-button")
    for (let buttonLikeElement of buttonLikeElements) {
      buttonLikeElement.addEventListener("click", () => {
        buttonLikeElement.classList.add("-loading-like") // при нажатии на кнопку добавляю класс "лоадинг лайк"
        // лайк будет активен до запуска ф-ии renderUserPosts (147)
        // classList add/remove добавляет или убирает класс
        const postID = buttonLikeElement.dataset.postId //находим в разметке post-id // id posta a ne uzera
        const index = buttonLikeElement.closest(".post").dataset.index // находим index
        const userID = document.querySelector(".posts").dataset.userId
        const id = {
          userId: userID,
        }

        if (user && posts[index].isLiked === false) {
          addLike({
            token: getToken(),
            postID: postID, // id поста
          })
            .then(() => {
              return getPosts({ token: getToken(), id })
            })
            .then((response) => {
              newGetPosts(response) // перезаписываем newGetPosts после нажатия лайка
              return renderPostsPageComponent({ appEl, posts }) // ререндер страницы постов
            })
        } else if (user && posts[index].isLiked === true) {
          delLike({
            token: getToken(),
            postID: postID,
          })
            .then(() => {
              return getPosts({ token: getToken(), id })
            })
            .then((response) => {
              newGetPosts(response)
              console.log(response)
              return renderPostsPageComponent({ appEl, posts })
            })
        }
      })
    }
  }
  liveLikes()

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
