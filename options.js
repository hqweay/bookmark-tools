
$('#btn-click').click(function () {
    console.log("start...");
    init();
})


function init() {
    chrome.bookmarks.getTree(analyseBookMark);
}

function splitBookMarkName(value) {
    // value = "书签栏::博客"
    var words = value.split('::')
    return words;
}

// 书签栏 移动设备书签 其它书签
function analyseBookMark(data) {
    let value = $('.ipt').val().trim();
    var words = splitBookMarkName(value);
    data = getFirstLevelBookMarksFloder(data);
    // 获取到目标文件夹
    data = getTargetBookMarksFloder(data, words);
    // 递归获取目标文件夹的所有书签
    let list = getBookmarks(data);
    // console.log(arr);
    getBookMarkDown(list);
}

// 获取 合法 rss 地址
function getValidRSS(list) {

}

// 获取 markdown 格式链接
function getBookMarkDown(list) {
    console.log("get markdown ...");
    let str = "";

    if (list.length == 0) {
        str = "请参考下面输入样例 ：）";
    } else {
        str = '# List\n';
        for (let i = 0; i < list.length; i++) {
            str = str.concat('[').concat(list[i].title).concat(']').concat('(').concat(list[i].url).concat(')\n');
        }

    }
    $('.mrk-cnt #mrk-cnt').val(str);
}


const rssConfig = ["/feed", "rss", "feed.xml", "atom.xml"]



function getBookmarks(data) {
    var list = [];
    getBookmarksByFolder(data, list);
    return list;
}
function getBookmarksByFolder(data, list) {
    var recursionConfig = $('#recursion').is(':checked');

    for (var children in data) {
        if (typeof (data[children]) == 'object') {
            let subData = data[children];
            for (let index = 0; index < subData.length; index++) {
                if (subData[index].url != undefined) {
                    list.push({
                        'title': subData[index].title,
                        'url': subData[index].url
                    })
                } else {
                    if (recursionConfig) {
                        getBookmarksByFolder(subData[index], list);
                    }
                }
            }
        }
    }
}

function getTargetBookMarksFloder(data, words) {
    if (words.length === 0) {
        return data;
    } else {
        data = getTargetBookMarksFloderByWord(data, words[0]);
        words.splice(0, 1);
        return getTargetBookMarksFloder(data, words);
    }

}

function getTargetBookMarksFloderByWord(data, word) {
    for (let children in data) {
        if (typeof (data[children]) == 'object') {
            data = data[children];
            for (let index in data) {
                if (data[index].title === word) {
                    return data[index];
                }
            }
        }
    }
}

// util function
function getFirstLevelBookMarksFloder(data) {
    for (var children in data) {
        if (typeof (data[children]) == 'object' && data[children].title == '') {
            return data[children];
        } else {
            return getFirstLevelBookMarksFloder(data[children]);
        }
    }
}