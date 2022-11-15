const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";
const friends = [];
const dataPanel = document.querySelector("#dataPanel");
const input = document.querySelector(".input-search");
const searchBtn = document.querySelector(".btn-search");
let filterList = [];
let MyFriend = JSON.parse(localStorage.getItem("MyFriend"));
const NUM_PER_PAGE = 20;
const pagination = document.querySelector("#pagination");
const favorite = document.querySelector(".favorite");
//- 清單與卡片格式切換
let currentPage = 1;
const modeSwitcher = document.querySelector("#mode-switcher");
const cardBtn = document.querySelector("#btn-card-ver");
const listBtn = document.querySelector("#btn-list-ver");

//- 渲染畫面
function rederFriendList(data) {
  let HTMLcontent = "";
  data.forEach((item) => {
    if (dataPanel.dataset.mode === "card") {
      HTMLcontent += `
            <div class="col col-sm-6 col-md-4 col-lg-3 mb-3">
          <div>
            <div class="card">
            `;
      //- 添加男女外框顏色
      if (item.gender === "male") {
        HTMLcontent += `
          <div class="img-container male">
      `;
      } else if (item.gender === "female") {
        HTMLcontent += `
          <div class="img-container female">
      `;
      }
      HTMLcontent += `
                <img
                src=${item.avatar}
                class="card-img-top"
                alt="..."
              />
            </div>
              
              <div class="card-body text-center">
                <h5 class="card-title">${item.name + " " + item.surname}</h5>
                <p>${item.region + ", age : " + item.age}</p>
              </div>
              
                <div class="card-footer d-flex justify-content-around align-items-center flex-wrap">
                  <button
                  class="btn btn-primary btn-show-more"
                  data-bs-toggle="modal"
                  data-bs-target="#more-modal"
                  data-id=${item.id}
                >
                  More
                </button>
                <button type="button" class="btn btn-danger btn-del-friend" data-id=${
                  item.id
                }>
                  Del
                </button>
                </div>
            </div>
          </div>
        </div>
    `;
    } else {
      HTMLcontent += `
                    <div class="col col-11 list-version-container border-top  my-2 pt-2">
          <div class="row">
            <section class="col col-8 left">${
              item.name + " " + item.surname
            }</section>
            <section class="col col-4 right text-center">
              <button
                  class="btn btn-primary btn-show-more"
                  data-bs-toggle="modal"
                  data-bs-target="#more-modal"
                  data-id=${item.id}
                >
                  More
                </button>
                <button class="btn btn btn-danger btn-del-friend" data-id=${
                  item.id
                }>Del</button>
            </section>
          </div>
        </div>
      `;
    }
    dataPanel.innerHTML = HTMLcontent;
  });
}
//- 顯示格式切換功能:
//- 確認目前頁面 -> 取得要顯示的人物資料 -> 確認是否要切換顯示格式 -> 渲染畫面
function checkMode(mode) {
  if (mode === dataPanel.dataset.mode) {
    //- 若跟目前的格式相同則不須切換
    return;
  }
  dataPanel.dataset.mode = mode;
}

//- Modal 內文顯示
function renderModal(id) {
  const modalName = document.querySelector("#person-modal-name");
  const modalDescription = document.querySelector("#person-modal-description");

  axios
    .get(BASE_URL + `/${id}`)
    .then((res) => {
      const data = res.data;
      modalName.textContent = data.name + " " + data.surname;
      modalDescription.innerHTML = `
                  <ul class="lh-lg">
              <li class="list-unstyled">Email : ${data.email}</li>
              <li class="list-unstyled">Gender : ${data.gender}</li>
              <li class="list-unstyled">Age : ${data.age}</li>
              <li class="list-unstyled">Region : ${data.region}</li>
              <li class="list-unstyled">Birthday : ${data.birthday}</li>
            </ul>
      `;
    })
    .catch((err) => {
      console.log(err);
    });
}

//- 搜尋功能
function searchFriends(keyword) {
  input.value = "";
  filterList = MyFriend.filter((friend) => {
    return (
      friend.name.trim().toLowerCase().includes(keyword) ||
      friend.surname.trim().toLowerCase().includes(keyword)
    );
  });
  genderFilter = MyFriend.filter((friend) => {
    return friend.gender.trim().toLowerCase() === keyword;
  });
  if (keyword === "male" || keyword === "female") {
    filterList = genderFilter;
  }
  if (filterList.length === 0) {
    return alert(`關鍵字: ${keyword} 沒有符合條件的人物`);
  }

  // paginator(filterList.length);
  // rederFriendList(getListByPage(1));
  genPagination(calPages(), 1);
  rederFriendList(getListByPage(1));
  //-搜尋完預設顯示第一頁，將currentPage重置
  currentPage = 1;
}
//- 動態產生分頁區塊
// function paginator(num) {
//   totalPage = Math.ceil(num / NUM_PER_PAGE);
//   let HTMLcontent =
//     '        <li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>';
//   for (let page = 2; page <= totalPage; page += 1) {
//     HTMLcontent += `
//             <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
//     `;
//   }
//   pagination.innerHTML = HTMLcontent;
// }
//- 動態產生分頁區塊-版本二
function calPages() {
  //-總顯示人物個數依據搜尋欄位是否有搜尋結果
  const num = filterList.length ? filterList.length : MyFriend.length;
  totalPages = Math.ceil(num / NUM_PER_PAGE);
  return totalPages;
}
function genPagination(totalPages, page) {
  let HTMLcontent = ``;
  let active;
  let beforePage = page - 1;
  let afterPage = page + 1;
  if (page > 1) {
    HTMLcontent += `
    <li class="page-item"><a class="page-link" id="page-prev" href="#">Prev</a></li>
    `;
    if (page > 2) {
      HTMLcontent += `
      <li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>
      `;
      if (page > 3) {
        HTMLcontent += `
          <li class="page-item"><a class="page-link dots" href="#">...</a></li>
        `;
      }
    }
  }
  //* 判定page第一頁後和最後頁前各要顯示多少頁面
  // if (page === 1) {
  //   afterPage += 2;
  // } else if (page === 2) {
  //   afterPage += 1;
  // }
  // if (page === totalPages) {
  //   beforePage -= 2;
  // } else if (page === totalPages - 1) {
  //   beforePage -= 1;
  // }
  for (let i = beforePage; i <= afterPage; i += 1) {
    if (i < 0) {
      continue;
    }
    if (i === 0) {
      i += 1;
    }
    if (i > totalPages) {
      break;
    }
    if (i === page) {
      active = "active";
    } else {
      active = "";
    }
    HTMLcontent += `
      <li class="page-item ${active}"><a class="page-link" href="#" data-page=${i}>${i}</a></li>
      `;
  }
  if (page < totalPages) {
    if (page < totalPages - 1) {
      if (page < totalPages - 2) {
        HTMLcontent += `
        <li class="page-item"><a class="page-link dots" href="#">...</a></li>
        `;
      }
      HTMLcontent += `
      <li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>
      `;
    }
    HTMLcontent += `
    <li class="page-item"><a class="page-link" id="page-next" href="#">Next</a></li>
    `;
  }
  pagination.innerHTML = HTMLcontent;
}
//- 分頁事件回傳對應內容
function getListByPage(page) {
  //- filterList 是否有內容，若有則選擇filter內容
  //- 若沒有則選擇全部friends
  const data = filterList.length ? filterList : MyFriend;
  const startIndex = (page - 1) * NUM_PER_PAGE;
  const endIndex = startIndex + NUM_PER_PAGE;
  const slicedItem = data.slice(startIndex, endIndex);
  return slicedItem;
}
//- 刪除功能
function delFriend(id) {
  const restItems = MyFriend.filter((friend) => {
    return Number(friend.id) !== id;
  });
  MyFriend = restItems;
  localStorage.setItem("MyFriend", JSON.stringify(MyFriend));
  // paginator(MyFriend.length);
  // rederFriendList(getListByPage(1));
  genPagination(calPages(), 1);
  rederFriendList(getListByPage(1));
  return alert("已從清單刪除好友!");
}

//- 事件觸發
dataPanel.addEventListener("click", function onPanelClick(e) {
  const target = e.target;
  const id = Number(target.dataset.id);
  if (target.matches(".btn-show-more")) {
    renderModal(id);
  } else if (target.matches(".btn-del-friend")) {
    delFriend(id);
  }
});

searchBtn.addEventListener("click", function onSearchBtn(e) {
  e.preventDefault();
  const keyWord = input.value.trim().toLowerCase();
  searchFriends(keyWord);
});

pagination.addEventListener("click", function onPagination(e) {
  const target = e.target;
  const targetPage = Number(target.dataset.page);
  if (target.tagName === "A" && !isNaN(targetPage)) {
    const targetParent = target.parentElement;
    const children = pagination.children;
    for (const child of children) {
      if (child.classList.contains("active") && child !== targetParent) {
        child.classList.remove("active");
      }
    }
    targetParent.classList.add("active");
    rederFriendList(getListByPage(targetPage));
    currentPage = targetPage;
    genPagination(calPages(), currentPage);
  }
  if (target.matches("#page-prev")) {
    currentPage -= 1;
  } else if (target.matches("#page-next")) {
    currentPage += 1;
  }
  rederFriendList(getListByPage(currentPage));
  genPagination(calPages(), currentPage);
});

//- 額外製作回到頁面上方button
window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    toTopBtn.style.display = "block";
  } else {
    toTopBtn.style.display = "none";
  }
});
toTopBtn.addEventListener("click", () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

//- 切換顯示模式
modeSwitcher.addEventListener("click", function onModeswitcher(e) {
  const target = e.target;
  if (target.matches("#btn-card-ver")) {
    checkMode("card");
    cardBtn.classList.add("btn-primary");
    listBtn.classList.remove("btn-primary");
  } else {
    checkMode("list");
    listBtn.classList.add("btn-primary");
    cardBtn.classList.remove("btn-primary");
  }
  rederFriendList(getListByPage(currentPage));
});
//- 串接API顯示初始資料
axios
  .get(BASE_URL)
  .then((res) => {
    friends.push(...res.data.results);
    // paginator(MyFriend.length);
    // rederFriendList(getListByPage(1));
    genPagination(calPages(), currentPage);
    rederFriendList(getListByPage(1));
  })
  .catch((err) => {
    console.log(err);
  });
