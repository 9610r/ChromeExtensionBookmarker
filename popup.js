// グローバル変数
var url = "";
var title = "";
var selectedText = "";
var areaText = "";

// URLを取得する関数
function getUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      let url = tabs[0].url;
      resolve(url);
    });
  });
}

// タイトルを取得する関数
function getTitle() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      let title = tabs[0].title;
      resolve(title);
    });
  });
}

// 選択されたテキストを取得する関数
async function getSelectedText() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let result;
  try {
    [{result}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => getSelection().toString(),
    });
  } catch (e) {
    return; // ignoring an unsupported page like chrome://extensions
  }
  return result;
}


// Traverse the bookmark tree, and print the folder and nodes.
async function popupDialog(query) { 
  url = await getUrl();
  title = await getTitle();
  selectedText = await getSelectedText();
  let element = document.getElementById("url");
  element.innerHTML = url;
  let title_element = document.getElementById("title");
  title_element.innerHTML = title;
  let select_element = document.getElementById("textarea");
  if (!selectedText == "") {
    select_element.value = "\"" + selectedText + "\"";
  }

}

function getTextArea() {
  return areaText = document.getElementById("textarea").value;
}

document.addEventListener('DOMContentLoaded', function () {
  popupDialog();
});

// コピーボタンをクリックした時のイベント
document.addEventListener('DOMContentLoaded', function() {
	var entryElement = document.getElementById('copy-button');
  
	entryElement.addEventListener('click', function() {
    // Shift + 左クリックでMarkdown形式でタイトルとURLをコピーする
    if (event.shiftKey) {
      const text = '['+title+']' + '('+url+')';
      copyToClipboard(text)
    }else{
    // 左クリックでURLをコピーする
      const text = url;
      copyToClipboard(text)
    }
	});
});


// 投稿ボタンをクリックした時のイベント
document.addEventListener('DOMContentLoaded', function() {
	var entryElement = document.getElementById('bookmark-button');
	entryElement.addEventListener('click', function() {
    // POST APIを叩く
    postTwitter();
	});
});

// クリップボードへコピー（コピーの処理）
function copyToClipboard (tagValue) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(tagValue).then(function () {
      messageActive()
    })
  } else {
    tagText.select()
    document.execCommand('copy')
    messageActive()
  }
}

// APIサーバーにPOSTする
function postTwitter() {
  let commentText = getTextArea();

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "token": "APIサーバーで設定したSECURET_TOKEN",
    "title": title,
    "url": url,
    "text": commentText
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  // POSTする
  fetch("https://XXXXX.XXXXXXXXXXX.XXXXXXX.railway.app/post", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  alert("tweet complated!\n" + title);
}