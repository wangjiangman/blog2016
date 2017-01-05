var upLoadPic = {
    picBox: '',
    smlPre: '',
    smlPreimg: '',
    imgWrap: '',
    picSltBox: '',
    picRizeBox: '',
    imgIniSize: {
        w: 0,
        h: 0
    },
    picSltBoxIniCrood: {
        x: 0,
        y: 0
    },
    sltBoxMin: 10,
    whbi: 0.75,
    scale: 1,

    picUploadIni: function(picBoxID, smlPreID) {
        this.picBox = document.getElementById(picBoxID),
            this.smlPre = document.getElementById(smlPreID),

            this.imgWrap = document.createElement("div");
        this.picSltBox = document.createElement("div");
        this.picRizeBox = document.createElement("div");

        this.imgWrap.style.position = "absolute";
        this.imgWrap.style.display = "none";
        this.imgWrap.style.zIndex = "10";
        this.imgWrap.id = "imgWrap";

        this.picSltBox.style.cursor = "move";
        this.picSltBox.style.position = "absolute";
        this.picSltBox.style.height = "100px";
        this.picSltBox.style.width = this.picSltBox.style.height.replace(/px/, "") * this.whbi + "px";
        this.picSltBox.style.left = "0";
        this.picSltBox.style.top = "0";
        this.picSltBox.style.border = "1px dotted red";
        this.picSltBox.style.zIndex = "20";
        this.picSltBox.id = "destSize";

        var sltBoxBg = document.createElement("div");
        sltBoxBg.style.width = "100%";
        sltBoxBg.style.height = "100%";
        sltBoxBg.style.background = "#DDD";
        sltBoxBg.style.filter = "alpha(opacity=50)";
        sltBoxBg.style.opacity = "0.5";

        this.picRizeBox.id = "picRizeBoxID"
        this.picRizeBox.style.cursor = "se-resize";
        this.picRizeBox.style.position = "absolute";
        this.picRizeBox.style.width = "10px";
        this.picRizeBox.style.height = "10px";
        this.picRizeBox.style.bottom = "0px";
        this.picRizeBox.style.right = "0px";
        this.picRizeBox.style.background = "black";

        this.picSltBox.appendChild(sltBoxBg);
        this.picSltBox.appendChild(this.picRizeBox);
        this.imgWrap.appendChild(this.picSltBox);
        this.picBox.appendChild(this.imgWrap);

        /*document.onselectstart=function(){return false;};
        document.onselect=function(){document.selection.empty()};*/
        document.documentElement.onmouseup = function(ev) {
            document.body.style.cursor = "";
            document.documentElement.onmousemove = null;
            var event = ev ? ev : window.event;
        }

        this.picSltBox.onmousedown = function(ev) {
            var event = ev ? ev : window.event;
            var target = event.target || event.srcElement;
            upLoadPic.picSltBoxIniCrood.x = event.clientX - upLoadPic.picSltBox.getBoundingClientRect().left;
            upLoadPic.picSltBoxIniCrood.y = event.clientY - upLoadPic.picSltBox.getBoundingClientRect().top;
            if (target.id == upLoadPic.picRizeBox.id) {
                document.body.style.cursor = "se-resize";
                document.documentElement.onmousemove = function(ev) {
                    var event = ev ? ev : window.event;
                    upLoadPic.sltBoxResize(event);
                }
            } else {
                document.documentElement.onmousemove = function(ev) {
                    var event = ev ? ev : window.event;
                    upLoadPic.sltBoxMove(event);
                };
            }

        }
    },
    changeImg: function(filename) {
        this.imgWrap.getElementsByTagName("img").length > 0 && this.imgWrap.removeChild(this.imgWrap.children[1]);
        this.smlPre.getElementsByTagName("img").length > 0 && this.smlPre.removeChild(this.smlPre.children[0]);
        var img = new Image();
        this.smlPreimg = new Image();
        if (typeof filename == '') return;
        img.src = this.smlPreimg.src = filename;
        this.smlPreimg.style.position = "absolute"
        var t = setInterval(function() {
            if (img.width == 0) {
                return;
            }
            clearInterval(t);
            upLoadPic.imgIniSize.w = img.width;
            upLoadPic.imgIniSize.h = img.height;
            //alert(this.imgIniSize.w+"......"+this.imgIniSize.h)
            if ((upLoadPic.picBox.clientWidth - img.width) < (upLoadPic.picBox.clientHeight - img.height)) {
                // img.style.width = upLoadPic.picBox.clientWidth+"px";
                img.style.width = upLoadPic.picBox.clientWidth + "px";
                img.style.height = "auto";
                upLoadPic.imgWrap.style.width = img.style.width;
                upLoadPic.imgWrap.style.height = parseInt(img.style.width) * img.height / img.width + "px";
                upLoadPic.scale = img.width / upLoadPic.picBox.clientWidth;
            } else {
                img.style.height = upLoadPic.picBox.clientHeight + "px";
                img.style.width = "auto";
                upLoadPic.imgWrap.style.height = img.style.height;
                upLoadPic.imgWrap.style.width = parseInt(img.style.height) * img.width / img.height + "px";
                upLoadPic.scale = img.height / upLoadPic.picBox.clientHeight;
            }

            upLoadPic.imgWrap.style.left = (upLoadPic.picBox.clientWidth - parseInt(upLoadPic.imgWrap.style.width)) / 2 + "px";
            upLoadPic.imgWrap.style.top = (upLoadPic.picBox.clientHeight - parseInt(upLoadPic.imgWrap.style.height)) / 2 + "px";
            if (img.height * upLoadPic.whbi > img.width) {
                upLoadPic.picSltBox.style.width = upLoadPic.imgWrap.style.width;
                upLoadPic.picSltBox.style.height = upLoadPic.imgWrap.style.width.replace(/[^\d\.]/gi, "") / upLoadPic.whbi + "px";
                upLoadPic.picSltBox.style.left = "0px";
                upLoadPic.picSltBox.style.top = (upLoadPic.imgWrap.style.height.replace(/[^\d\.]/gi, "") - upLoadPic.picSltBox.style.height.replace(/[^\d\.]/gi, "")) / 2 + "px";
            } else {
                upLoadPic.picSltBox.style.height = upLoadPic.imgWrap.style.height;
                upLoadPic.picSltBox.style.width = upLoadPic.imgWrap.style.height.replace(/[^\d\.]/gi, "") * upLoadPic.whbi + "px";
                upLoadPic.picSltBox.style.top = "0px";
                upLoadPic.picSltBox.style.left = (upLoadPic.imgWrap.style.width.replace(/[^\d\.]/gi, "") - upLoadPic.picSltBox.style.width.replace(/[^\d\.]/gi, "")) / 2 + "px";
            }

            upLoadPic.imgWrap.style.display = "block";

            upLoadPic.imgWrap.appendChild(img);
            upLoadPic.smlPre.appendChild(upLoadPic.smlPreimg);
            upLoadPic.picReview();
        }, 200)

    },

    sltBoxResize: function(event) {
        var width = parseInt(event.clientX) - this.picSltBox.getBoundingClientRect().left;
        var height = parseInt(event.clientY) - this.picSltBox.getBoundingClientRect().top;
        if (width < this.sltBoxMin) {
            width = this.sltBoxMin;
        }
        if (width > (this.imgWrap.clientWidth - parseInt(this.picSltBox.style.left))) {
            width = this.imgWrap.clientWidth - parseInt(this.picSltBox.style.left) - (this.picSltBox.offsetWidth - this.picSltBox.clientWidth);
        }
        if (height < this.sltBoxMin) {
            height = this.sltBoxMin;
        }
        if (height > (this.imgWrap.clientHeight - parseInt(this.picSltBox.style.top))) {
            height = this.imgWrap.clientHeight - parseInt(this.picSltBox.style.top) - (this.picSltBox.offsetHeight - this.picSltBox.clientHeight);
        }
        var len = width < height * this.whbi ? width : height * this.whbi;
        this.picSltBox.style.width = len + "px";
        this.picSltBox.style.height = len / this.whbi + "px";
        this.picReview();
    },
    sltBoxMove: function(event) {
        var leftOffset = parseInt(event.clientX) - (this.picSltBoxIniCrood.x + this.picSltBox.getBoundingClientRect().left);
        var topOffset = parseInt(event.clientY) - (this.picSltBoxIniCrood.y + this.picSltBox.getBoundingClientRect().top);
        var left = parseInt(this.picSltBox.style.left) + leftOffset;
        var top = parseInt(this.picSltBox.style.top) + topOffset;

        if (left > (this.imgWrap.clientWidth - this.picSltBox.offsetWidth)) {
            left = this.imgWrap.clientWidth - this.picSltBox.offsetWidth;
        }
        if (left < 0) {
            left = 0
        }
        if (top > (this.imgWrap.clientHeight - this.picSltBox.offsetHeight)) {
            top = this.imgWrap.clientHeight - this.picSltBox.offsetHeight;
        }
        if (top < 0) {
            top = 0
        }

        this.picSltBox.style.left = left + "px";
        this.picSltBox.style.top = top + "px";
        upLoadPic.picReview();
    },
    picReview: function() {
        var sltBigScale = this.smlPre.clientWidth / this.picSltBox.clientWidth;
        this.smlPreimg.width = this.imgWrap.clientWidth * sltBigScale;
        this.smlPreimg.height = this.imgWrap.clientHeight * sltBigScale;
        this.smlPreimg.style.left = -parseInt(this.picSltBox.style.left) * sltBigScale + "px";
        this.smlPreimg.style.top = -parseInt(this.picSltBox.style.top) * sltBigScale + "px";
    }
}
