const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";
const friends = [];
const dataPanel = document.querySelector("#dataPanel");
const input = document.querySelector(".input-search");
const searchBtn = document.querySelector(".btn-search");
let filterList = [];
const NUM_PER_PAGE = 20;
const pagination = document.querySelector("#pagination");
const toTopBtn = document.querySelector("#toTopBtn");
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
                <button type="button" class="btn btn-success btn-add-friend" data-id=${
                  item.id
                } id=${item.id}>
                  Add
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
                <button class="btn btn btn-success btn-add-friend" data-id=${
                  item.id
                } id=${item.id}>Add</button>
            </section>
          </div>
        </div>
      `;
    }
    dataPanel.innerHTML = HTMLcontent;
  });
  //-渲染時確認AddBtn是否要反灰表示已加過好友
  checkAddBtn();
}
//- 顯示格式切換:
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
//- 新增好友
function addFriend(id) {
  const friendList = JSON.parse(localStorage.getItem("MyFriend"));
  const newFriend = friends.find((friend) => {
    return Number(friend.id) === id;
  });
  if (friendList === null) {
    let newList = [];
    newList.push(newFriend);
    localStorage.setItem("MyFriend", JSON.stringify(newList));
  } else {
    if (isFriendExist(id)) {
      return alert("你們已經是朋友了!!");
    } else {
      friendList.push(newFriend);
      localStorage.setItem("MyFriend", JSON.stringify(friendList));
      return alert("新增朋友成功!!");
    }
  }
}
//- 好友是否存在
function isFriendExist(id) {
  const friendList = JSON.parse(localStorage.getItem("MyFriend"));
  if (friendList.some((friend) => Number(friend.id) === id)) {
    return true;
  }
  return false;
}
//- 確認是否須將已經是朋友的人物add按鈕反灰
function checkAddBtn() {
  const friendList = JSON.parse(localStorage.getItem("MyFriend"));
  friendList.forEach((friend) => {
    //-針對好友名單的每一物件id獲取渲染頁面時的DOM元素
    let addBtn = document.getElementById(`${friend.id}`);
    if (addBtn) {
      //-若找的到代表存在於好友名單，新增add按鈕樣式
      addBtn.classList.remove("btn-success");
      addBtn.classList.add("btn-light");
      addBtn.style.cursor = "not-allowed";
    }
  });
}

//- 搜尋功能
function searchFriends(keyword) {
  input.value = "";
  filterList = friends.filter((friend) => {
    return (
      friend.name.trim().toLowerCase().includes(keyword) ||
      friend.surname.trim().toLowerCase().includes(keyword)
    );
  });
  //- 特殊關鍵字(性別篩選)
  genderFilter = friends.filter((friend) => {
    return friend.gender.trim().toLowerCase() === keyword;
  });
  if (keyword === "male" || keyword === "female") {
    filterList = genderFilter;
  }
  if (filterList.length === 0) {
    return alert(`關鍵字: ${keyword} 沒有符合條件的人物`);
  }
  // paginator(filterList.length);
  genPagination(calPages(), 1);
  rederFriendList(getListByPage(1));
  //-搜尋完預設顯示第一頁，將currentPage重置
  currentPage = 1;
}
//- 動態產生分頁區塊
function paginator(num) {
  totalPage = Math.ceil(num / NUM_PER_PAGE);
  let HTMLcontent =
    '        <li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>';
  for (let page = 2; page <= totalPage; page += 1) {
    HTMLcontent += `
            <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `;
  }
  pagination.innerHTML = HTMLcontent;
}

//- 動態產生分頁區塊-版本二
function calPages() {
  const num = filterList.length ? filterList.length : friends.length;
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
  //* 判定page第一頁後面和最後頁前面各顯示多少頁面
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
  const data = filterList.length ? filterList : friends;
  const startIndex = (page - 1) * NUM_PER_PAGE;
  const endIndex = startIndex + NUM_PER_PAGE;
  const slicedItem = data.slice(startIndex, endIndex);
  return slicedItem;
}

//- 事件觸發
dataPanel.addEventListener("click", function onPanelClick(e) {
  const target = e.target;
  const id = Number(target.dataset.id);
  if (target.matches(".btn-show-more")) {
    renderModal(id);
  } else if (target.matches(".btn-add-friend")) {
    addFriend(id);
    target.classList.remove("btn-success");
    target.classList.add("btn-light");
    target.style.cursor = "not-allowed";
  }
});

searchBtn.addEventListener("click", function onSearchBtn(e) {
  e.preventDefault();
  const keyWord = input.value.trim().toLowerCase();
  console.log(keyWord);
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
//- 回到頁面上方button
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
    genPagination(calPages(), currentPage);
    // paginator(friends.length);
    rederFriendList(getListByPage(1));
  })
  .catch((err) => {
    console.log(err);
  });

//- 分頁產生器(參考網路資源)
//calling function with passing parameters and adding inside element which is ul tag
// element.innerHTML = createPagination(totalPages, page);
function createPagination(totalPages, page) {
  let liTag = "";
  let active;
  let beforePage = page - 1;
  let afterPage = page + 1;
  if (page > 1) {
    //show the prev button if the page value is greater than 1
    liTag += `<li class="btn prev" onclick="createPagination(totalPages, ${
      page - 1
    })"><span><i class="fas fa-angle-left"></i> Prev</span></li>`;
  }

  if (page > 2) {
    //if page value is greater than 2 then add 1 after the previous button
    liTag += `<li class="first numb" onclick="createPagination(totalPages, 1)"><span>1</span></li>`;
    if (page > 3) {
      //if page value is greater than 3 then add this (...) after the first li or page
      liTag += `<li class="dots"><span>...</span></li>`;
    }
  }

  // how many pages or li show before the current li
  if (page == totalPages) {
    beforePage = beforePage - 2;
  } else if (page == totalPages - 1) {
    beforePage = beforePage - 1;
  }
  // how many pages or li show after the current li
  if (page == 1) {
    afterPage = afterPage + 2;
  } else if (page == 2) {
    afterPage = afterPage + 1;
  }

  for (let plength = beforePage; plength <= afterPage; plength++) {
    if (plength > totalPages) {
      //if plength is greater than totalPage length then continue
      continue;
    }
    if (plength == 0) {
      //if plength is 0 than add +1 in plength value
      plength = plength + 1;
    }
    if (page == plength) {
      //if page is equal to plength than assign active string in the active variable
      active = "active";
    } else {
      //else leave empty to the active variable
      active = "";
    }
    liTag += `<li class="numb ${active}" onclick="createPagination(totalPages, ${plength})"><span>${plength}</span></li>`;
  }

  if (page < totalPages - 1) {
    //if page value is less than totalPage value by -1 then show the last li or page
    if (page < totalPages - 2) {
      //if page value is less than totalPage value by -2 then add this (...) before the last li or page
      liTag += `<li class="dots"><span>...</span></li>`;
    }
    liTag += `<li class="last numb" onclick="createPagination(totalPages, ${totalPages})"><span>${totalPages}</span></li>`;
  }

  if (page < totalPages) {
    //show the next button if the page value is less than totalPage(20)
    liTag += `<li class="btn next" onclick="createPagination(totalPages, ${
      page + 1
    })"><span>Next <i class="fas fa-angle-right"></i></span></li>`;
  }
  element.innerHTML = liTag; //add li tag inside ul tag
  return liTag; //reurn the li tag
}
