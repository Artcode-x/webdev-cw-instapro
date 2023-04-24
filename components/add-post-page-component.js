import { goToPage } from "../index.js"
import { renderHeaderComponent } from "./header-component.js"
import { POSTS_PAGE } from "../routes.js"
export function renderAddPostPageComponent({ appEl, onAddPostClick, element }) {
  const render = () => {
    // TODO: Реализовать страницу добавления поста

    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      
      <div class="page-header">
      <h1 class="logo">instapro</h1>
      <div class="post-header">
  </div>      
  </div>

      <div class="form">
              <h3 class="form-title">
                Добавить&nbsp;пост
                </h3>
              <div class="form-inputs">
    

                  <label style="text-align: center;">Опишите фотографию</label>
                  <input type="text" id="post-input" class="input" placeholder="Добавьте описание к посту">
                  
                  <div class="form-error"></div>
                  <div style="text-align: center;"> <input type="file" id="image-input"> </div>
                  <button class="button" id="add-button">Добавить пост</button>
              </div>
            
              
          </div>  


      
  `

    appEl.innerHTML = appHtml

    document.querySelector(".logo").addEventListener("click", () => {
      goToPage(POSTS_PAGE)
    })

    document.getElementById("add-button").addEventListener("click", () => {
      // <input type="file" id="image-input" />
      const fileInputElement = document.getElementById("image-input")
      postImage({ file: fileInputElement.files[0] })

      function postImage({ file }) {
        const data = new FormData()
        data.append("file", file)

        return fetch(baseHost + "/api/upload/image", {
          method: "POST",
          body: data,
        })
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            console.log(data.fileUrl)
            const pic = data.fileUrl
            console.log(pic)

            const post = document.getElementById("post-input")
            const postValue = post.value
            console.log(postValue)

            onAddPostClick({
              // отсюда передаем данные в index.js,  ф-ия callback
              description: postValue,
              imageUrl: pic,
            })
          })
      }
    })
  }

  render()
}

import { baseHost } from "../api.js"
