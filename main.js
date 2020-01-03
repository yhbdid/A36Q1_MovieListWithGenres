(function () {

  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'

  const dataPanel = document.getElementById('data-panel')
  const sideBar = document.getElementById('sidebar')
  const pagination = document.getElementById('pagination')

  const GENRES = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }

  const data = []
  // 希望每頁顯示 12 筆資料   
  const ITEM_PER_PAGE = 12
  // 在 getPageData 的外面設置一個變數 paginationData，讓 getPageData 擁有固定的資料來源
  // 如果呼叫 getPageData 時有傳入資料，用新傳入的資料，刷新 paginationData；
  // 如果呼叫 getPageData 時沒有傳入資料，沿用 paginationData 裡的內容，確保 slice 始終有東西可以處理。
  let paginationData = []
  // 預定顯示首頁為第1頁分頁
  let currentPage = 1

  //////////////////////////////////////////////////////////////////////////
  // 掛監聽器
  // listen to side bar click event
  sideBar.addEventListener('click', event => {
    // prevent submit button default action : refresh display
    event.preventDefault()

    if (event.target.text === "Return to All") {
      // 計算總頁數並演算 li.page-item
      getTotalPages(data)
      // 取出特定頁面的資料，default first page = 1
      getPageData(1, data)
      return
    }

    // findKey:代表使用者點擊的分類，在GENRES中對應之key
    let findKey = 0
    for (let [key, value] of Object.entries(GENRES)) {
      if (value === event.target.text) { findKey = key }
    }
    // results: 儲存符合分類的所有電影資料
    let results = []
    // 在所有data(電影集合)中，每個movie(電影)的genres陣列中，若有元素數值等於findKey，表示該電影符合該分類
    data.forEach(movie => {
      movie.genres.forEach(item => {
        if (Number(item) === Number(findKey)) {
          results.push(movie)
        }
      })
    }
    )
    if (results.length === 0) {
      alert("Sorry, we didn't find any movie of " + event.target.text + " type.")
      return
    }
    displayDataList(results)
    // 計算總頁數並演算 li.page-item
    getTotalPages(results)
    // 取出特定頁面的資料，default first page = 1
    getPageData(1, results)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    // 點擊到 a 標籤，則透過將頁碼傳入 getPageData 來切換分頁
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  //////////////////////////////////////////////////////////////////////////
  // 相關函式
  // 計算資料總頁數
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      // li.page-item 裡使用 data-page 來標注頁數，方便後續取用頁碼。
      // 加入"javascript:;" 註明這個 a 標籤會觸發 JavaScript 程式。     
      pageItemContent += `
      <li class="page-item">    
        <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
      </li>
    `
    }
    pagination.innerHTML = pageItemContent
  }

  // 將資料分頁，並將結果傳送給 displayDataList 然後渲染
  function getPageData(pageNum, data) {
    // 確認是否更動分頁頁碼
    currentPage = pageNum || currentPage
    // 如果呼叫 getPageData 時有傳入資料，用新傳入的資料，刷新 paginationData；
    // 如果呼叫 getPageData 時沒有傳入資料，沿用 paginationData 裡的內容，確保 slice 始終有東西可以處理。
    paginationData = data || paginationData
    // 找到 data Array 中的第 (頁碼 - 1) * 12 項，再從該位置往後取出 12 筆資料
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  // 渲染電影資料
  function displayDataList(data) {
    let htmlContent = ''
    // 在 HTML 標籤中定義 data-* 的屬性  
    data.forEach((item) => {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.title}</h5>`
      // 寫進data中每個item(電影)的genres陣列中的每個elm(分類)
      item.genres.forEach(elm => { htmlContent += `<span>${GENRES[elm]}</span><span> </span>` })
      htmlContent += `  
            </div>    
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  // 渲染分類清單
  function displaySideBar() {
    let htmlContent = ''
    // 加上回到所有的選項
    htmlContent += `<a href="#">Return to All</a>`
    // 把GENRES每個分類寫進去
    Object.keys(GENRES).forEach((item) => { htmlContent += `<a href="#">${GENRES[item]}</a>` })
    sideBar.innerHTML = htmlContent
  }

  //////////////////////////////////////////////////////////////////////////
  // 主程式
  // get data from API and display data list
  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    // 計算總頁數並演算 li.page-item
    getTotalPages(data)
    // 取出特定頁面的資料，default first page = 1
    getPageData(1, data)
  }).catch((err) => console.log(err))

  // display side bar
  displaySideBar()

})()
