
new Vue({
    el: '#app',
    data: {
        config: {
            selected: "random",
        },
        folderName: "",
        recursionConfig: true,
        randomBookmark: {
            id: "",
            url: "",
            title: "",
        },
        folders: [
            // "Bookmarks bar",
            "Bookmarks bar/博客",
            // "other bookmark/picture",
            // "书签栏/博客",
            // "书签栏/博客/技术博客"
        ],
        markdown: {
            content: ""
        },
        errorInfo: ""
    },
    created() {
        chrome.bookmarks.getTree(this.initConfig);
    },
    methods: {
        init() {
            chrome.bookmarks.getTree(this.analyseBookMark);


        },
        // 书签栏 移动设备书签 其它书签
        analyseBookMark(data) {
            let value = this.folderName.trim();
            var words = this.splitBookMarkName(value);
            data = this.getFirstLevelBookMarksFolder(data);

            // 获取到目标文件夹
            data = this.getTargetBookMarksFolder(data, words);
            // 递归获取目标文件夹的所有书签
            let list = this.getBookmarks(data);

            if (this.config.selected == "random") {
                this.getRandomBookmark(list);
            } else if (this.config.selected == "markdown") {
                this.getMarkdown(list);
            }
        },
        // 选择该文件夹
        chooseFolder(folder) {
            this.folderName = folder;
        },
        removeBookmarkByID(id) {
            let flag = confirm("confrim remove this bookmark?")
            if (flag) {
                chrome.bookmarks.remove(id);
                alert("remove sucess.");
            }
        },
        // 获取 markdown 格式链接
        getMarkdown(list) {
            console.log("get markdown ...");
            let str = "";

            if (list.length == 0) {
                str = "请参考下面输入样例 ：）";
            } else {
                str = '# List\n\n';
                for (let i = 0; i < list.length; i++) {
                    str = str.concat('[').concat(list[i].title).concat(']').concat('(').concat(list[i].url).concat(')\n\n');
                }

            }
            this.markdown.content = str;
        },
        // 随机获取一个书签
        getRandomBookmark(list) {
            if (list.length === 0) {
                this.errorInfo = `
                bookmark folder do not exists,
                 try to check the root folder is '书签栏' or 'Bookmarks bar'.
                `;
            } else {
                let index = Math.floor(Math.random() * list.length);
                let bookmark = list[index];
                this.randomBookmark.id = bookmark.id;
                this.randomBookmark.url = bookmark.url;
                this.randomBookmark.title = bookmark.title;
                // window.open(this.url, 'target');
            }

        },
        splitBookMarkName(value) {
            // value = "书签栏::博客"
            var words = value.split('/')
            return words;
        },
        getBookmarks(data) {
            var list = [];
            this.getBookmarksByFolder(data, list);
            return list;
        },
        getBookmarksByFolder(data, list) {
            var recursionConfig = this.recursionConfig;
            for (var children in data) {
                if (typeof (data[children]) == 'object') {
                    let subData = data[children];
                    for (let index = 0; index < subData.length; index++) {
                        if (subData[index].url != undefined) {
                            list.push({
                                'id': subData[index].id,
                                'title': subData[index].title,
                                'url': subData[index].url
                            })
                        } else {
                            if (recursionConfig) {
                                this.getBookmarksByFolder(subData[index], list);
                            }
                        }
                    }
                }
            }
        },

        getTargetBookMarksFolder(data, words) {
            if (words.length === 0) {
                return data;
            } else {
                data = this.getTargetBookMarksFolderByWord(data, words[0]);
                words.splice(0, 1);
                return this.getTargetBookMarksFolder(data, words);
            }

        },

        getTargetBookMarksFolderByWord(data, word) {
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
        },

        // util function 先获取根书签文件夹
        getFirstLevelBookMarksFolder(data) {
            for (var children in data) {
                if (typeof (data[children]) == 'object' && data[children].title == '') {
                    return data[children];
                } else {
                    return getFirstLevelBookMarksFolder(data[children]);
                }
            }
        },
        initConfig(data) {
            data = this.getFirstLevelBookMarksFolder(data);
            data.children.forEach(element => {
                this.folders.push(element.title);
            });
            this.folderName = this.folders[0];
        }
    },

})