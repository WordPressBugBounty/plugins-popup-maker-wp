var SGPM_APP_URL = "https://popupmaker.com/";
var SGPM_STATS_URL = "https://stats.popupmaker.com/";
var SGPM_WEBPUSH_URL = "https://webpush.popupmaker.com/";
// if (typeof SGPM_DEBUG_MODE !== 'undefined' && SGPM_DEBUG_MODE == 1) {
// 	SGPM_APP_URL = 'http://localhost/popup-service/';
// 	SGPM_STATS_URL = 'http://localhost/pmstats/';
// }
// if (typeof SGPM_DEBUG_MODE !== 'undefined' && SGPM_DEBUG_MODE == 2) {
// 	SGPM_APP_URL = 'https://sandbox.popupmaker.com/';
// 	SGPM_STATS_URL = 'https://sandboxstats.popupmaker.com/';
// 	SGPM_WEBPUSH_URL = 'https://arev.popupmaker.com/';
// }
var SGPM_POPUP_OBJ = {};
var SGPM_POPUP_ID = "";
var SGPM_MAIN_DIV = "";
var SGPM_MAIN_DIV_DEFAULT_CONTENT = {};
var SGPM_MAIN_DIV_OBJ = {};
var SGPM_POPUP_STATISTICS = {};
var SGPM_HAS_SEND_DATA = false;
var SGPM_USER_PAGE_BODY_STYLES = "";
window.addEventListener("load", function (event) {
  SGPM_USER_PAGE_BODY_STYLES = document.body.style.cssText;
  SGPM_USER_PAGE_HTML_STYLES =
    document.getElementsByTagName("html")[0].style.cssText;
});

var SGPM_DISABLE_PAGE_SCROLLING_POPUP_COUNT = 0;
var PUSH_AUTORESPONDER_IS_NOT_DRAFT = 0;

function SGPMPopup(config) {
  //private variables
  var isEnabledPopup = config.enable;
  var integrations = config.integrations;
  var popupName = config.popupName;
  var initialConfig = config;
  var isInited = false;
  var mainDiv = null;
  var contentDiv = null;
  var DIV = null;
  var opened = false;
  var resizeTimeout = null;
  var overlayDiv = null;
  var defaultZIndex = 2147483447;
  var defaultWidth = "50%";
  var defaultHeight = "-1px";
  var closeButtonImage = null;
  var closeButtonOverlay = null;
  var popupId = config.id;
  var hashId = config.hashId;
  SGPM_POPUP_ID = config.id;
  var displayBranding = config.displayBranding || false;
  var events = config.events || [];
  var openDelay = config.openDelay || 0;
  var repetitiveDelay;
  var disablePageScrolling = config.disablePageScrolling;

  var floatingButton = config.floatingButton || {
    action: "",
    actionScope: "",
    actionParams: null,
    params: {
      style: "off",
      position: "topCenter",
      backgroundColor: "#f00",
      borderSize: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      borderColor: "#000000",
      text: "Sign up!",
      textColor: "#f00444",
    },
  };

  var openAnimation = config.openAnimation || {
    type: "none",
    speed: 0,
  };

  var fitBackgroundImg = null;

  var openBehavior = config.openBehavior || {
    showOnDesktop: true,
    showOnMobile: true,
    showOnTablet: true,
    trigger: {
      on: "allPages",
      filters: "",
    },
    afterXPagesVisit: {
      enabled: false,
      filters: "",
    },
    spokenLanguages: {
      enabled: "off",
      filterType: "include",
      languages: null,
    },
    showingCount: {
      enabled: "off",
      count: 1,
    },
  };

  var showingFrequency = openBehavior.showingFrequency || {
    enabled: "off",
    selectors: JSON.stringify({
      count: 1,
      expire: 365,
      pageLevel: false,
      sameOriginCookie: false,
    }),
  };
  var closeAnimation = config.closeAnimation || {
    type: "none",
    speed: 0,
  };
  var closeBehavior = config.closeBehavior || {
    allowed: true,
    showButton: true,
    showCloseButtonAfterTime: 0,
    buttonPosition: "left",
    topPosition: 0,
    leftPosition: 0,
    autoclose: false,
    overlayShouldClose: true,
    contentShouldClose: false,
    escShouldClose: true,
  };

  var contentClickBehavior = config.contentClickBehavior || {
    enable: false,
    option: "",
    redirectUrl: "",
    redirectNewTab: true,
    copyText: "",
  };
  var closeButton = config.closeButton || {
    data: "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDUxRjY0ODgyQTkxMTFFMjk0RkU5NjI5MEVDQTI2QzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDUxRjY0ODkyQTkxMTFFMjk0RkU5NjI5MEVDQTI2QzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENTFGNjQ4NjJBOTExMUUyOTRGRTk2MjkwRUNBMjZDNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENTFGNjQ4NzJBOTExMUUyOTRGRTk2MjkwRUNBMjZDNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuT868wAAABESURBVHja7M4xEQAwDAOxuPw5uwi6ZeigB/CntJ2lkmytznwZFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYW1qsrwABYuwNkimqm3gAAAABJRU5ErkJggg==",
    width: 16,
    height: 16,
  };
  var overlay = config.overlay || {
    visible: true,
    color: "#000",
    opacity: 0.7,
  };
  var contentBox = config.contentBox || {
    padding: 8,
    showBackground: true,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 0,
    shadowColor: "#ccc",
    shadowSpread: 10,
    shadowBlure: 10,
    scrollingEnabled: true,
  };
  var contents = config.contents || "";
  var position = config.position || {
    left: "center",
    top: "center",
  };

  if (
    (typeof position.left == "undefined" ||
      (isNaN(parseInt(position.left)) && position.left != "center")) &&
    (typeof position.right == "undefined" ||
      (isNaN(parseInt(position.right)) && position.right != "center"))
  ) {
    position.left = "center";
  }
  if (
    (typeof position.top == "undefined" ||
      (isNaN(parseInt(position.top)) && position.top != "center")) &&
    (typeof position.bottom == "undefined" ||
      (isNaN(parseInt(position.bottom)) && position.bottom != "center"))
  ) {
    position.top = "center";
  }

  if (
    typeof config.showOnce !== "undefined" &&
    config.showOnce != false &&
    (typeof openBehavior.showingFrequency === "undefined" ||
      openBehavior.showingFrequency.enabled == "off")
  ) {
    showingFrequency.enabled = "on";
    showingFrequency.selectors = JSON.stringify({
      count: 1,
      expire: config.showOnce,
      pageLevel: config.cookiePageLevel,
      sameOriginCookie: config.sameOrigin,
    });
  }

  if (
    typeof openBehavior.showingCount !== "undefined" &&
    openBehavior.showingCount.enabled == "on" &&
    (typeof openBehavior.showingFrequency === "undefined" ||
      openBehavior.showingFrequency.enabled == "off")
  ) {
    showingFrequency.enabled = "on";
    showingFrequency.selectors = JSON.stringify({
      count: openBehavior.showingCount,
      expire: 365,
      pageLevel: config.cookiePageLevel,
      sameOriginCookie: config.sameOrigin,
    });
  }

  var sizingRanges = config.sizingRanges || [
    {
      screenFrom: { width: -1, height: -1 },
      screenTo: { width: -1, height: -1 },
      width: defaultWidth,
      height: defaultHeight,
      maxWidth: -1,
      maxHeight: -1,
      minWidth: -1,
      minHeight: -1,
    },
  ];
  var shouldOpen =
    config.shouldOpen ||
    function () {
      return true;
    };
  var willOpen = config.willOpen || function () {};
  var didOpen = config.didOpen || function () {};
  var shouldClose =
    config.shouldClose ||
    function () {
      return true;
    };
  var willClose = config.willClose || function () {};
  var didClose = config.didClose || function () {};

  // open animation classes
  var OPEN_ANIMATION_POP =
    "@-webkit-keyframes popin{from{-webkit-transform:scale(.8);opacity:0}to{-webkit-transform:scale(1);opacity:1}}@-moz-keyframes popin{from{-moz-transform:scale(.8);opacity:0}to{-moz-transform:scale(1);opacity:1}}@keyframes popin{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}";
  var OPEN_ANIMATION_FADE =
    "@-webkit-keyframes fadein{from{opacity:0}to{opacity:1}}@-moz-keyframes fadein{from{opacity:0}to{opacity:1}}@keyframes fadein{from{opacity:0}to{opacity:1}}";
  var OPEN_ANIMATION_FLIP =
    "@-webkit-keyframes flipintoright{from{-webkit-transform:rotateY(90deg) scale(.9)}to{-webkit-transform:rotateY(0)}}@-moz-keyframes flipintoright{from{-moz-transform:rotateY(90deg) scale(.9)}to{-moz-transform:rotateY(0)}}@keyframes flipintoright{from{transform:rotateY(90deg) scale(.9)}to{transform:rotateY(0)}}";
  var OPEN_ANIMATION_SLIDELEFT =
    "@-webkit-keyframes slideinfromright{from{-webkit-transform:translate3d({start},0,0)}to{-webkit-transform:translate3d(0,0,0)}}@-moz-keyframes slideinfromright{from{-moz-transform:translateX({start})}to{-moz-transform:translateX(0)}}@keyframes slideinfromright{from{transform:translateX({start})}to{transform:translateX(0)}}";
  var OPEN_ANIMATION_SLIDERIGHT =
    "@-webkit-keyframes slideinfromleft{from{-webkit-transform:translate3d({start},0,0)}to{-webkit-transform:translate3d(0,0,0)}}@-moz-keyframes slideinfromleft{from{-moz-transform:translateX({start})}to{-moz-transform:translateX(0)}}@keyframes slideinfromleft{from{transform:translateX({start})}to{transform:translateX(0)}}";
  var OPEN_ANIMATION_FLOW =
    "@-webkit-keyframes flowinfromright{0%{-webkit-transform:translateX(100%) scale(.7)}30%,40%{-webkit-transform:translateX(0) scale(.7)}100%{-webkit-transform:translateX(0) scale(1)}}@-moz-keyframes flowinfromright{0%{-moz-transform:translateX(100%) scale(.7)}30%,40%{-moz-transform:translateX(0) scale(.7)}100%{-moz-transform:translateX(0) scale(1)}}@keyframes flowinfromright{0%{transform:translateX(100%) scale(.7)}30%,40%{transform:translateX(0) scale(.7)}100%{transform:translateX(0) scale(1)}}";
  var OPEN_ANIMATION_SLIDEUP =
    "@-webkit-keyframes slideinfrombottom{from{-webkit-transform:translateY({start})}to{-webkit-transform:translateY(0)}}@-moz-keyframes slideinfrombottom{from{-moz-transform:translateY({start})}to{-moz-transform:translateY(0)}}@keyframes slideinfrombottom{from{transform:translateY({start})}to{transform:translateY(0)}}";
  var OPEN_ANIMATION_SLIDEDOWN =
    "@-webkit-keyframes slideinfromtop{from{-webkit-transform:translateY({start})}to{-webkit-transform:translateY(0)}}@-moz-keyframes slideinfromtop{from{-moz-transform:translateY({start})}to{-moz-transform:translateY(0)}}@keyframes slideinfromtop{from{transform:translateY({start})}to{transform:translateY(0)}}";

  // close animation classes
  var CLOSE_ANIMATION_SLIDELEFT =
    "@-webkit-keyframes slideouttoleft{from{-webkit-transform:translate3d(0,0,0)}to{-webkit-transform:translate3d({end},0,0)}}@-moz-keyframes slideouttoleft{from{-moz-transform:translateX(0)}to{-moz-transform:translateX({end})}}@keyframes slideouttoleft{from{transform:translateX(0)}to{transform:translateX({end})}}";
  var CLOSE_ANIMATION_SLIDERIGHT =
    "@-webkit-keyframes slideouttoright{from{-webkit-transform:translate3d(0,0,0)}to{-webkit-transform:translate3d({end},0,0)}}@-moz-keyframes slideouttoright{from{-moz-transform:translateX(0)}to{-moz-transform:translateX({end})}}@keyframes slideouttoright{from{transform:translateX(0)}to{transform:translateX({end})}}";
  var CLOSE_ANIMATION_POP =
    "@-webkit-keyframes popout{from{-webkit-transform:scale(1);opacity:1}to{-webkit-transform:scale(.8);opacity:0}}@-moz-keyframes popout{from{-moz-transform:scale(1);opacity:1}to{-moz-transform:scale(.8);opacity:0}}@keyframes popout{from{transform:scale(1);opacity:1}to{transform:scale(.8);opacity:0}}";
  var CLOSE_ANIMATION_FADE =
    "@-webkit-keyframes fadeout{from{opacity:1}to{opacity:0}}@-moz-keyframes fadeout{from{opacity:1}to{opacity:0}}@keyframes fadeout{from{opacity:1}to{opacity:0}}";
  var CLOSE_ANIMATION_FLIP =
    "@-webkit-keyframes flipouttoright{from{-webkit-transform:rotateY(0)}to{-webkit-transform:rotateY(90deg) scale(.9)}}@-moz-keyframes flipouttoright{from{-moz-transform:rotateY(0)}to{-moz-transform:rotateY(90deg) scale(.9)}}@keyframes flipouttoright{from{transform:rotateY(0)}to{transform:rotateY(90deg) scale(.9)}}";
  var CLOSE_ANIMATION_FLOW =
    "@-webkit-keyframes flowouttoright{0%{-webkit-transform:translateX(0) scale(1)}60%,70%{-webkit-transform:translateX(0) scale(.7)}100%{-webkit-transform:translateX(100%) scale(.7)}}@-moz-keyframes flowouttoright{0%{-moz-transform:translateX(0) scale(1)}60%,70%{-moz-transform:translateX(0) scale(.7)}100%{-moz-transform:translateX(100%) scale(.7)}}@keyframes flowouttoright{0%{transform:translateX(0) scale(1)}60%,70%{transform:translateX(0) scale(.7)}100%{transform:translateX(100%) scale(.7)}}";
  var CLOSE_ANIMATION_SLIDEUP =
    "@-webkit-keyframes slideouttotop{from{-webkit-transform:translateY(0)}to{-webkit-transform:translateY({end})}}@-moz-keyframes slideouttotop{from{-moz-transform:translateY(0)}to{-moz-transform:translateY({end})}}@keyframes slideouttotop{from{transform:translateY(0)}to{transform:translateY({end})}}";
  var CLOSE_ANIMATION_SLIDEDOWN =
    "@-webkit-keyframes slideouttobottom{from{-webkit-transform:translateY(0)}to{-webkit-transform:translateY({end})}}@-moz-keyframes slideouttobottom{from{-moz-transform:translateY(0)}to{-moz-transform:translateY({end})}}@keyframes slideouttobottom{from{transform:translateY(0)}to{transform:translateY({end})}}";
  var countdownContainersInitialSizes = [];

  // init integrations
  SGIntegrations.init(integrations);

  //private methods

  function setContentClickBehavior() {
    if (!contentClickBehavior.enable && !closeBehavior.contentShouldClose) {
      return;
    }

    mainDiv.style.cursor = "pointer";
    var handler = function (e) {
      if (
        contentClickBehavior.enable &&
        contentClickBehavior.option == "redirectUrl"
      ) {
        if (contentClickBehavior.redirectNewTab) {
          window.open(contentClickBehavior.redirectUrl);
        } else {
          window.location.href = contentClickBehavior.redirectUrl;
        }
      } else if (
        contentClickBehavior.enable &&
        contentClickBehavior.option == "copyText"
      ) {
        if (e.target.tagName == "SELECT" || e.target.tagName == "INPUT") return;

        var textArea = document.createElement("textarea");
        textArea.value = contentClickBehavior.copyText;
        mainDiv.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        mainDiv.removeChild(textArea);

        e.target.focus();
      }

      if (closeBehavior.contentShouldClose) {
        closePopup();
      }
    };
    mainDiv.addEventListener("click", handler);
  }

  function addAnimationClass(classString) {
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = classString;
    style.id = "sgpm-effect-custom-style";
    document.getElementsByTagName("head")[0].appendChild(style);
  }

  function setMainDivStyles(sizeConfig) {
    //mainDiv.style.zIndex = defaultZIndex+10;
    contentDiv.style.zIndex = defaultZIndex + 10;
    mainDiv.style.boxSizing = "content-box";

    if (sizeConfig.minHeight != -1) {
      mainDiv.style.minHeight = sizeConfig.minHeight + "px";
    }

    if (sizeConfig.minWidth != -1) {
      mainDiv.style.minWidth = sizeConfig.minWidth + "px";
    }

    if (sizeConfig.maxHeight != -1) {
      mainDiv.style.maxHeight = sizeConfig.maxHeight + "px";
    }
    if (sizeConfig.maxWidth != -1) {
      mainDiv.style.maxWidth = sizeConfig.maxWidth + "px";
    }

    if (contentBox.borderStyle) {
      mainDiv.style.borderStyle = contentBox.borderStyle;
    }

    if (contentBox.borderColor) {
      mainDiv.style.borderColor = contentBox.borderColor;
    }

    if (contentBox.borderRadius) {
      var borderRadius = contentBox.borderRadius + "%";
      if (typeof contentBox.borderRadius === "object") {
        var property =
          contentBox.borderRadius.propertyPixels == "on" ? "px " : "% ";
        borderRadius =
          contentBox.borderRadius.topLeft +
          property +
          contentBox.borderRadius.topRight +
          property +
          contentBox.borderRadius.bottomRight +
          property +
          contentBox.borderRadius.bottomLeft +
          property;
      }
      mainDiv.style.setProperty("border-radius", borderRadius, "important");
    }

    if (contentBox.borderWidth) {
      if (typeof contentBox.borderWidth === "object") {
        mainDiv.style.borderTopWidth = contentBox.borderWidth.top + "px";
        mainDiv.style.borderRightWidth = contentBox.borderWidth.right + "px";
        mainDiv.style.borderBottomWidth = contentBox.borderWidth.bottom + "px";
        mainDiv.style.borderLeftWidth = contentBox.borderWidth.left + "px";
      } else {
        mainDiv.style.borderWidth = contentBox.borderWidth + "px";
      }
    }

    if (contentBox.padding) {
      var contentPadding = contentBox.padding + "px";
      if (typeof contentBox.padding === "object") {
        contentPadding =
          contentBox.padding.top +
          "px " +
          contentBox.padding.right +
          "px " +
          contentBox.padding.bottom +
          "px " +
          contentBox.padding.left +
          "px";
      }

      mainDiv.style.padding = contentPadding;
    }

    var widthToSet = sizeConfig.width || defaultWidth;
    var padding = contentBox.padding || 0;
    var paddingRelativity = 2 * padding;
    if (typeof padding === "object") {
      paddingRelativity = parseInt(padding.left) + parseInt(padding.right);
    }
    if (widthToSet.indexOf("%") > -1) {
      var widthNum = parseFloat(widthToSet);
      widthToSet =
        (widthNum / 100) * window.innerWidth -
        paddingRelativity -
        parseInt(mainDiv.style.borderLeftWidth) -
        parseInt(mainDiv.style.borderRightWidth) +
        "px";
    } else {
      widthToSet = parseInt(widthToSet) - paddingRelativity + "px";
    }
    mainDiv.style.width = widthToSet;

    if (typeof padding === "object") {
      paddingRelativity = parseInt(padding.top) + parseInt(padding.bottom);
    }
    var heightToSet = sizeConfig.height || defaultHeight;
    if (heightToSet.indexOf("%") > -1) {
      var heightNum = parseFloat(heightToSet);
      heightToSet =
        (heightNum / 100) * window.innerHeight -
        paddingRelativity -
        parseInt(mainDiv.style.borderTopWidth) -
        parseInt(mainDiv.style.borderBottomWidth) +
        "px";
    } else {
      heightToSet = parseInt(heightToSet) - paddingRelativity + "px";
    }

    mainDiv.style.height = heightToSet;

    if (contentBox.showBackground && contentBox.backgroundColor) {
      mainDiv.style.backgroundColor = contentBox.backgroundColor;
    }

    if (contentBox.shadowColor) {
      mainDiv.style.boxShadow =
        "0 0 " +
        contentBox.shadowBlur +
        "px " +
        contentBox.shadowSpread +
        "px " +
        contentBox.shadowColor;
    }

    if (contentBox.scrollingEnabled) {
      mainDiv.style.overflow = "auto";
      mainDiv.style.overflowX = "hidden";
    } else {
      mainDiv.style.overflow = "hidden";
    }
  }

  function setBackground() {
    if (fitBackgroundImg) {
      fitBackgroundImg.parentNode.removeChild(fitBackgroundImg);
      fitBackgroundImg = null;
    }

    if (contentBox.showBackground) {
      if (!contentBox.backgroundImage) {
        return;
      }

      mainDiv.style.backgroundImage = "url(" + contentBox.backgroundImage + ")";

      if (contentBox.backgroundMode == "cover") {
        mainDiv.style.backgroundSize = "cover";
        mainDiv.style.backgroundRepeat = "no-repeat";
        mainDiv.style.backgroundPosition = contentBox.backgroundImageMode || "";
      } else if (contentBox.backgroundMode == "contain") {
        mainDiv.style.backgroundSize = "contain";
        mainDiv.style.backgroundRepeat = "no-repeat";
      } else if (contentBox.backgroundMode == "repeat") {
        mainDiv.style.backgroundRepeat = "repeat";
      } else if (contentBox.backgroundMode == "fit") {
        fitBackgroundImg = document.createElement("img");
        fitBackgroundImg.style.display = "none";
        document.body.appendChild(fitBackgroundImg);
        fitBackgroundImg.onload = function () {
          onWindowRsize();
        };
        fitBackgroundImg.src = contentBox.backgroundImage;
        mainDiv.style.backgroundSize = "cover";
        mainDiv.style.backgroundRepeat = "no-repeat";
      } else {
        mainDiv.style.backgroundRepeat = "no-repeat";
      }
    }
  }

  function setFitBackground() {
    if (!fitBackgroundImg) return;

    contentBox.backgroundColor = "transparent";
    var imgHeight = fitBackgroundImg.height;
    var imgWidth = fitBackgroundImg.width;
    var winHeight = window.innerHeight;
    var winWidth = window.innerWidth;
    var minMargin = 40;
    var popupWidth = 0,
      popupHeight = 0;

    if (
      imgWidth < winWidth - 2 * minMargin &&
      imgHeight < winHeight - 2 * minMargin
    ) {
      popupWidth = imgWidth;
      popupHeight = imgHeight;
    } else {
      if (winWidth > winHeight) {
        popupHeight = winHeight - 2 * minMargin;
        popupWidth = (popupHeight * imgWidth) / imgHeight;

        if (popupWidth > winWidth - 2 * minMargin) {
          popupWidth = winWidth - 2 * minMargin;
          popupHeight = (popupWidth * imgHeight) / imgWidth;
        }
      } else {
        popupWidth = winWidth - 2 * minMargin;
        popupHeight = (popupWidth * imgHeight) / imgWidth;

        if (popupHeight > winHeight - 2 * minMargin) {
          popupHeight = winHeight - 2 * minMargin;
          popupWidth = (popupHeight * imgWidth) / imgHeight;
        }
      }
    }

    sizingRanges[0].width = popupWidth + "px";
    sizingRanges[0].height = popupHeight + "px";
  }

  function positionPopup() {
    contentDiv.style.position = "fixed";
    var border = contentBox.borderWidth || 0;
    var borderRelativity = 2 * border;
    if (typeof border === "object") {
      borderRelativity = parseInt(border.left) + parseInt(border.right);
    }
    var padding = contentBox.padding || 0;
    if (
      typeof position.left != "undefined" &&
      (!isNaN(parseInt(position.left)) || position.left == "center")
    ) {
      if (position.left == "center") {
        contentDiv.style.left =
          (window.innerWidth -
            parseInt(mainDiv.clientWidth) -
            borderRelativity) /
            2 +
          "px";
      } else {
        contentDiv.style.left = parseInt(position.left) + "px";
      }
    } else {
      if (position.right == "center") {
        contentDiv.style.left =
          (window.innerWidth - parseInt(mainDiv.clientWidth) - 2 * border) / 2 +
          "px";
      } else {
        contentDiv.style.left =
          window.innerWidth -
          parseInt(position.right) -
          parseInt(mainDiv.clientWidth) -
          borderRelativity -
          getScrollbarWidth() +
          "px";
      }
    }

    var brandingHeight = 0;
    if (displayBranding) {
      brandingHeight = 20;
    }

    if (typeof border === "object") {
      borderRelativity = parseInt(border.top) + parseInt(border.bottom);
    }

    if (
      typeof position.top != "undefined" &&
      (!isNaN(parseInt(position.top)) || position.top == "center")
    ) {
      if (position.top == "center") {
        contentDiv.style.top =
          (window.innerHeight -
            parseInt(mainDiv.clientHeight) -
            borderRelativity -
            brandingHeight) /
            2 +
          "px";
      } else {
        contentDiv.style.top = position.top + "px";
      }
    } else {
      if (position.bottom == "center") {
        contentDiv.style.top =
          (window.innerHeight -
            parseInt(mainDiv.clientHeight) -
            2 * border -
            brandingHeight) /
            2 +
          "px";
      } else {
        contentDiv.style.bottom = position.bottom + "px";
      }
    }
  }

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function getSizeConfig() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var config = null;
    var candidates = [];
    for (var i = 0; i < sizingRanges.length; i++) {
      var tmpConf = sizingRanges[i];

      if (
        (tmpConf.screenFrom.width == -1 && tmpConf.screenTo.width == -1) ||
        (tmpConf.screenFrom.width == -1 &&
          windowWidth < tmpConf.screenTo.width) ||
        (tmpConf.screenTo.width == -1 &&
          windowWidth > tmpConf.screenFrom.width) ||
        (windowWidth < tmpConf.screenTo.width &&
          windowWidth > tmpConf.screenFrom.width)
      ) {
        candidates.push(tmpConf);
      }
    }
    for (var i = 0; i < candidates.length; i++) {
      //if for any size
      var tmpConf = candidates[i];

      if (
        (tmpConf.screenFrom.height == -1 && tmpConf.screenTo.height == -1) ||
        (tmpConf.screenFrom.height == -1 &&
          windowHeight < tmpConf.screenTo.height) ||
        (tmpConf.screenTo.height == -1 &&
          windowHeight > tmpConf.screenFrom.height) ||
        (windowHeight < tmpConf.screenTo.height &&
          windowHeight > tmpConf.screenFrom.height)
      ) {
        continue;
      } else {
        candidates.splice(i, 1);
        i--;
      }
    }
    config = candidates[0];
    if (!config) {
      config = {
        screenFrom: { width: -1, height: -1 },
        screenTo: { width: -1, height: -1 },
        width: "50%",
        height: defaultHeight,
        maxWidth: -1,
        maxHeight: -1,
        minWidth: -1,
        minHeight: -1,
      };
    }

    return config;
  }

  function drawOverlay() {
    if (!overlay.visible) {
      return;
    }
    overlayDiv = document.createElement("DIV");
    overlayDiv.style.display = "block";
    overlayDiv.style.zIndex = defaultZIndex;
    overlayDiv.style.backgroundColor = overlay.color;
    overlayDiv.style.opacity = overlay.opacity / 100;
    overlayDiv.style.position = "fixed";
    overlayDiv.style.left = "0";
    overlayDiv.style.top = "0";
    overlayDiv.style.width = "100%";
    overlayDiv.style.height = "100%";
    overlayDiv.style.webkitTransform = "translateZ(-1000px)";
    if (overlay.addClass) {
      overlayDiv.className = overlay.addClass;
    }
    if (closeBehavior.overlayShouldClose) {
      overlayDiv.onclick = closePopup;
    }

    document.body.appendChild(overlayDiv);
  }

  function removeOverlay() {
    if (overlayDiv) {
      overlayDiv.style.display = "none";
      document.body.removeChild(overlayDiv);
      overlayDiv = null;
    }
  }

  function setCloseButton(mainDiv) {
    if (!closeButton.data) {
      return;
    }

    if (closeBehavior.showButton === false) {
      return;
    }

    if (parseInt(closeBehavior.showCloseButtonAfterTime) > 0) {
      closeButtonImage.style.display = "none";

      if (
        closeBehavior.showAfterCounter &&
        closeBehavior.showAfterCounter.enabled == "on"
      ) {
        if (typeof closeBehavior.showAfterCounter.label === "undefined") {
          closeBehavior.showAfterCounter.label = "";
        }

        var showCloseButtonAfterTime = closeBehavior.showCloseButtonAfterTime;
        /** close botton overlay styles */
        var labelFontSize = closeBehavior.showAfterCounter.fontSize + "px";
        if (typeof closeBehavior.showAfterCounter.fontSize === "undefined") {
          labelFontSize = parseInt(closeButton.height) + "px";
        }
        var labelFontColor = closeBehavior.showAfterCounter.fontColor;
        if (typeof closeBehavior.showAfterCounter.fontColor === "undefined") {
          var labelFontColor = "rgba(0, 0, 0, 1)";
        }

        closeButtonOverlay.style.fontSize = labelFontSize;
        closeButtonOverlay.style.color = labelFontColor;

        closeButtonOverlay.innerHTML =
          closeBehavior.showAfterCounter.label +
          " " +
          parseInt(showCloseButtonAfterTime);
        var interval = setInterval(function () {
          showCloseButtonAfterTime--;
          if (showCloseButtonAfterTime == 0) {
            clearInterval(interval);
            return;
          }
          closeButtonOverlay.innerHTML =
            closeBehavior.showAfterCounter.label +
            " " +
            parseInt(showCloseButtonAfterTime);
        }, 1000);
      }

      setTimeout(function () {
        closeButtonOverlay.innerHTML = "";
        closeButtonImage.style.display = "block";
      }, parseInt(closeBehavior.showCloseButtonAfterTime) * 1000);
    }

    closeButtonImage.style.zIndex = defaultZIndex + 20;
    closeButtonImage.style.position = "absolute";
    closeButtonImage.style.float = "left";
    closeButtonImage.style.left = "-" + closeButton.width / 2 + "px";
    closeButtonImage.style.top = "-" + closeButton.height / 2 + "px";
    closeButtonImage.style.width = closeButton.width + "px";
    closeButtonImage.style.cursor = "pointer";
    closeButtonImage.style.height = closeButton.height + "px";
    closeButtonImage.src = "" + closeButton.data + "";
    closeButtonImage.style.backgroundRepeat = "no-repeat";
    closeButtonImage.style.backgroundSize = "cover";
    closeButtonImage.onclick = function () {
      closePopup(true);
    };

    /**
     * overlay for close button to show animation or countdown
     * using all close button positions to follow it correctly
     */
    closeButtonOverlay.style.zIndex = defaultZIndex;
    closeButtonOverlay.style.padding = "2px 5px 2px 5px";
    closeButtonOverlay.style.textAlign = "left";
    closeButtonOverlay.style.position = "absolute";
    closeButtonOverlay.style.float = "left";
    closeButtonOverlay.style.top =
      "-" + parseInt(closeButton.height / 2) + "px";
    closeButtonOverlay.style.left =
      "-" + parseInt(closeButton.height / 2) + "px";
    closeButtonOverlay.style.width = parseInt(mainDiv.style.width) / 4 + "px";
    closeButtonOverlay.style.textAlign = "left";
    closeButtonOverlay.style.height = parseInt(closeButton.height) + "px";

    positionCloseButton(mainDiv);
  }

  function positionCloseButton(mainDiv) {
    if (closeBehavior.buttonPosition == "left") {
      closeButtonImage.style.left =
        closeButton.width / 2 + parseFloat(closeBehavior.leftPosition) + "px";
      closeButtonOverlay.style.left =
        closeButton.width / 2 + parseFloat(closeBehavior.leftPosition) + "px";
    } else if (closeBehavior.buttonPosition == "right") {
      var border = contentBox.borderWidth || 0;
      var padding = contentBox.padding || 0;
      var borderRelativity = 2 * border;
      var paddingRelativity = 2 * padding;
      if (typeof border === "object") {
        borderRelativity = parseInt(border.left) + parseInt(border.right);
      }
      if (typeof padding === "object") {
        paddingRelativity = parseInt(padding.left) + parseInt(padding.right);
      }
      var left = 0;
      var mainDivWidth = mainDiv.style.width;
      if (
        mainDiv.style.maxWidth &&
        parseInt(mainDivWidth) > parseInt(mainDiv.style.maxWidth)
      ) {
        mainDivWidth = mainDiv.style.maxWidth;
      }
      if (
        mainDiv.style.minWidth &&
        parseInt(mainDivWidth) < parseInt(mainDiv.style.minWidth)
      ) {
        mainDivWidth = mainDiv.style.minWidth;
      }

      left =
        parseFloat(mainDivWidth) -
        Math.ceil(closeButton.width / 2) +
        paddingRelativity +
        borderRelativity;
      if (closeBehavior.leftPosition) {
        left = left - parseFloat(closeBehavior.leftPosition);
      }
      closeButtonImage.style.left = left + "px";
      closeButtonOverlay.style.left =
        parseFloat(left) - parseInt(mainDiv.style.width) / 4 + 12 + "px";
      closeButtonOverlay.style.textAlign = "right";
    }

    closeButtonImage.style.top = parseFloat(closeBehavior.topPosition) + "px";
    closeButtonOverlay.style.top = parseFloat(closeBehavior.topPosition) + "px";
  }

  function changeLayoutHeightToHigh(popupMainWrapper) {
    var gridStackItem = popupMainWrapper.querySelectorAll(
      ".grid-stack-item-content"
    );

    for (var i = 0; i < gridStackItem.length; i++) {
      if (gridStackItem[i].scrollHeight > gridStackItem[i].clientHeight) {
        gridStackItem[i].parentNode.style.height =
          gridStackItem[i].scrollHeight + "px";
      }
    }
  }

  function changeLayoutHeightToLow(popupMainWrapper) {
    var gridStackItem = popupMainWrapper.querySelectorAll(
      ".grid-stack-item-content"
    );
    for (var i = 0; i < gridStackItem.length; i++) {
      while (
        gridStackItem[i].clientHeight >
          parseInt(gridStackItem[i].parentNode.getAttribute("data-gs-height")) *
            60 &&
        gridStackItem[i].clientHeight == gridStackItem[i].scrollHeight
      ) {
        gridStackItem[i].style.height =
          gridStackItem[i].clientHeight - 60 + "px";
      }
      gridStackItem[i].parentNode.style.height =
        gridStackItem[i].scrollHeight + "px";
      gridStackItem[i].style.height = "";
    }
  }

  function alignDiv(popupMainWrapper) {
    var gridStackItem = popupMainWrapper.querySelectorAll(".grid-stack-item");
    gridStackItem = Array.prototype.slice.call(gridStackItem);
    gridStackItem.sort(function (a, b) {
      if (a.getAttribute("data-gs-y") == b.getAttribute("data-gs-y")) {
        return a.getAttribute("data-gs-x") - b.getAttribute("data-gs-x");
      }
      return a.getAttribute("data-gs-y") - b.getAttribute("data-gs-y");
    });
    for (var i = 0; i < gridStackItem.length; i++) {
      pushDivs(gridStackItem[i], popupMainWrapper);
    }
  }

  function pushDivs(elem, popupMainWrapper) {
    var gridStackItem = popupMainWrapper.querySelectorAll(".grid-stack-item");
    var width = elem.clientWidth;
    var x0 = parseInt(elem.getAttribute("data-gs-x"));
    var x1 = parseInt(elem.getAttribute("data-gs-width")) + x0 - 1;
    var y0 = parseInt(elem.getAttribute("data-gs-y"));
    var y1 = parseInt(elem.getAttribute("data-gs-height")) + y0;

    var parentDivs = [];
    for (var i = 0; i < gridStackItem.length; i++) {
      var x2 = parseInt(gridStackItem[i].getAttribute("data-gs-x"));
      var y2 = parseInt(gridStackItem[i].getAttribute("data-gs-y"));
      var x3 =
        parseInt(gridStackItem[i].getAttribute("data-gs-width")) + x2 - 1;
      var y3 =
        parseInt(gridStackItem[i].getAttribute("data-gs-height")) + y2 - 1;

      if (
        y0 > y3 &&
        ((x2 >= x0 && x2 <= x1) ||
          (x3 >= x0 && x3 <= x1) ||
          (x0 >= x2 && x0 <= x3))
      ) {
        parentDivs.push(gridStackItem[i]);
      }
    }
    var maxHeight = 0;
    for (var i = 0; i < parentDivs.length; i++) {
      var height = parentDivs[i].style.height
        ? parseInt(parentDivs[i].style.height)
        : parseInt(parentDivs[i].getAttribute("data-gs-height")) * 60;
      var top = parentDivs[i].style.height
        ? parseInt(parentDivs[i].style.top)
        : parseInt(parentDivs[i].getAttribute("data-gs-y")) * 60;

      if (height + top > maxHeight) {
        maxHeight = height + top;
      }
    }
    elem.style.top = maxHeight + "px";

    /* set ordering for mobile devices */
    setGsLayoutsOrderingForMobile(popupMainWrapper);

    var maxHeightForPopup = 0;
    for (var i = 0; i < gridStackItem.length; i++) {
      var height = gridStackItem[i].style.height
        ? parseInt(gridStackItem[i].style.height)
        : parseInt(gridStackItem[i].getAttribute("data-gs-height")) * 60;
      var top = gridStackItem[i].style.height
        ? parseInt(gridStackItem[i].style.top)
        : parseInt(gridStackItem[i].getAttribute("data-gs-y")) * 60;

      if (height + top > maxHeightForPopup) {
        maxHeightForPopup = height + top;
      }
    }

    popupMainWrapper.querySelector(".grid-stack").style.height =
      maxHeightForPopup + "px";

    var windowHeight = window.innerHeight;
    var border = contentBox.borderWidth || 0;
    var padding = contentBox.padding || 0;
    var borderRelativity = 2 * border;
    var paddingRelativity = 2 * padding;
    if (typeof border === "object") {
      borderRelativity = parseInt(border.top) + parseInt(border.bottom);
    }
    if (typeof padding === "object") {
      paddingRelativity = parseInt(padding.left) + parseInt(padding.right);
    }

    var brandingHeight = 0;
    if (displayBranding) {
      brandingHeight = 20;
    }

    popupMainWrapper.querySelector(".grid-stack").style.maxHeight =
      windowHeight -
      (borderRelativity + paddingRelativity + brandingHeight) +
      "px";
  }

  function setGsLayoutsOrderingForMobile(popupMainWrapper) {
    if (!SGP.iSMobile()) return;

    var gridStackItem = popupMainWrapper.querySelectorAll(".grid-stack-item");
    if (gridStackItem.length < 1) return;

    /* sort gridstack items depending on X or Y axis */
    gridStackItem = Array.prototype.slice.call(gridStackItem);
    gridStackItem.sort(function (a, b) {
      var aX = parseInt(a.getAttribute("data-gs-x"));
      var bX = parseInt(b.getAttribute("data-gs-x"));

      if (aX < bX) return -1;
      if (aX > bX) return 1;
      return 0;
    });
    gridStackItem.sort(function (a, b) {
      var aY = parseInt(a.getAttribute("data-gs-y"));
      var bY = parseInt(b.getAttribute("data-gs-y"));

      if (aY < bY) return -1;
      if (aY > bY) return 1;
      return 0;
    });

    /* get layouts heights */
    var elementsHeighsValues = [];
    for (var i = 0; i < gridStackItem.length; i++) {
      var gsEl = gridStackItem[i];
      var gsHeight = parseInt(gsEl.style.height.replace(/\D+/g, ""));

      elementsHeighsValues.push(gsHeight);
    }

    /* convert height values to top values | array[i - 1] + array[i] */
    elementsTopValues = elementsHeighsValues.map(function (elem, index) {
      return elementsHeighsValues.slice(0, index + 1).reduce(function (a, b) {
        return a + b;
      });
    });

    elementsTopValues.unshift(0);
    elementsTopValues.pop(elementsTopValues.length - 1);

    for (var i = 0; i < gridStackItem.length; i++) {
      var gsEl = gridStackItem[i];
      gsEl.setAttribute("data-gs-width", 12);

      gsEl.style.top = elementsTopValues[i] + "px";
      gsEl.style.left = 0;
      gsEl.style.right = 0;
    }
  }

  function resizeLayout() {
    changeLayoutHeightToHigh(mainDiv);
    changeLayoutHeightToLow(mainDiv);
    alignDiv(mainDiv);
  }

  function onWindowRsize() {
    /*clearTimeout(resizeTimeout);
		 resizeTimeout = setTimeout(function(){resizeBox();positionPopup();positionCloseButton(mainDiv);},500);*/

    setFitBackground();
    resizeBox();
    resizeLayout();
    resizeSpinner();
    countdownResponsibility(mainDiv);
    positionPopup();
    positionCloseButton(mainDiv);
  }

  function countdownResponsibility(popupMainWrapper) {
    if (!opened) return;

    var screenWidth = window.innerWidth;
    /* maximal possibele container width for very small screen sizes like iphone 6/7/8 and smaller */
    // var lowesPosibleElementWidthForMobile = 80; /* % */

    var countdownElements = document.querySelectorAll(
      '.sgpm-popup-maker-wrapper [data-sgpopuptype = "FECountdownPopup"]'
    );
    var defaultSizings = {
      width: 318,
      wrapperPadding: 10,
      unitFontSize: 30,
      unitPadding: 15,
      formatFontSize: 16,
    };

    if (countdownElements.length) {
      for (var i = 0; i < countdownElements.length; i++) {
        var container = countdownElements[i].querySelector(
          ".sg-countdown-clock"
        );
        if (!container) continue;

        var wrapper = container.getElementsByClassName(
          "sg-countdown-date-wrapper"
        );
        var currentWidth = container.offsetWidth;
        var wrapperPadding =
          (currentWidth * defaultSizings.wrapperPadding) / defaultSizings.width;
        var unitFontSize =
          (currentWidth * defaultSizings.unitFontSize) / defaultSizings.width;
        var unitPadding =
          (currentWidth * defaultSizings.unitPadding) / defaultSizings.width;
        var formatFontSize =
          (currentWidth * defaultSizings.formatFontSize) / defaultSizings.width;

        /* visible elements count */
        var visibleWrapperCount = 0;
        for (var k = 0; k < wrapper.length; k++) {
          var innerContainer = wrapper[k];
          var containerStyles = window.getComputedStyle(innerContainer);

          if (containerStyles.display != "none") {
            visibleWrapperCount++;
          }
        }

        /**
         * for mobile screens set constant width for container
         * increase paddings and font sizes
         *
         * floating pointer value balancer
         *
         */
        if (screenWidth < 500) {
          if (typeof popupMainWrapper === "undefined") {
            popupMainWrapper = mainDiv;
          }
          var possibleWrapperMaxWidht = 400.0; /* % */
          var defaultWrapperMaxWidht = 700.0; /* px */
          var elementsMaxPosibleWidth = 70; /* % */
          var reductionBalancer = 25.0; /* unit */

          var wrapperMaxWidht = popupMainWrapper.style.maxWidth;
          var wrapperActualWidht = popupMainWrapper.style.width;
          var containerWidth = container.style.width;

          var wrapperMaxWidhtFloat = parseFloat(
            wrapperMaxWidht.replace(/(px|%)/i, "")
          );
          var wrapperActualWidhtFloat = parseFloat(
            wrapperActualWidht.replace(/(px|%)/i, "")
          );
          var containerWidhFloat = parseFloat(
            containerWidth.replace(/(px|%)/i, "")
          );

          if (wrapperMaxWidhtFloat <= possibleWrapperMaxWidht) {
            wrapperMaxWidhtFloat = defaultWrapperMaxWidht;
          }

          if (typeof countdownContainersInitialSizes[i] === "undefined") {
            countdownContainersInitialSizes[i] = containerWidhFloat;
          }

          var wrapperReductionPercentage =
            (wrapperActualWidhtFloat * 100) / wrapperMaxWidhtFloat -
            reductionBalancer;
          var containerIncreasePercentage =
            (wrapperReductionPercentage * containerWidhFloat) / 100;

          wrapperReductionPercentage = parseFloat(
            wrapperReductionPercentage.toFixed(2)
          );
          containerIncreasePercentage = parseFloat(
            containerIncreasePercentage.toFixed(2)
          );

          var calculatedWidth =
            containerIncreasePercentage + countdownContainersInitialSizes[i];

          if (calculatedWidth >= elementsMaxPosibleWidth) {
            calculatedWidth = countdownContainersInitialSizes[i];
            containerIncreasePercentage = 0;
          }

          /* set container style */
          container.style = "width: " + calculatedWidth + "% !important";

          /** set correct scale for mobile screens */
          if (visibleWrapperCount == 4) {
            var unitsBalancer = (containerIncreasePercentage * 12) / 100;
            unitsBalancer = parseFloat(unitsBalancer.toFixed(2));
            unitsBalancer = parseFloat(unitsBalancer.toFixed(2));

            wrapperPadding += unitsBalancer;
            unitFontSize += unitsBalancer + 0.8;
            unitPadding += unitsBalancer;
            formatFontSize += unitsBalancer - 0.3;
          }

          if (visibleWrapperCount == 3) {
            var unitsBalancer = (containerIncreasePercentage * 17) / 100;
            unitsBalancer = parseFloat(unitsBalancer.toFixed(2));

            wrapperPadding += unitsBalancer;
            unitFontSize += unitsBalancer + 2.5;
            unitPadding += unitsBalancer;
            formatFontSize += unitsBalancer + 1.5;
          }

          if (visibleWrapperCount == 2) {
            var unitsBalancer = (containerIncreasePercentage * 45) / 100;
            unitsBalancer = parseFloat(unitsBalancer.toFixed(2));

            wrapperPadding += unitsBalancer;
            unitFontSize += unitsBalancer + 2.8;
            unitPadding += unitsBalancer;
            formatFontSize += unitsBalancer;
          }
        }

        for (var j = 0; j < wrapper.length; j++) {
          var innerContainer = wrapper[j];
          var unit = innerContainer.getElementsByClassName(
            "sg-countdown-date-unit"
          )[0];
          var format = innerContainer.getElementsByClassName(
            "sg-countdown-date-format"
          )[0];
          if (currentWidth < defaultSizings.width) {
            innerContainer.style.setProperty(
              "padding",
              wrapperPadding + "px",
              "important"
            );
            unit.style.setProperty(
              "font-size",
              unitFontSize + "px",
              "important"
            );
            unit.style.setProperty("padding", unitPadding + "px", "important");
            format.style.setProperty(
              "font-size",
              formatFontSize + "px",
              "important"
            );
          } else {
            innerContainer.style.setProperty(
              "padding",
              defaultSizings.wrapperPadding + "px",
              "important"
            );
            unit.style.setProperty(
              "font-size",
              defaultSizings.unitFontSize + "px",
              "important"
            );
            unit.style.setProperty(
              "padding",
              defaultSizings.unitPadding + "px",
              "important"
            );
            format.style.setProperty(
              "font-size",
              defaultSizings.formatFontSize + "px",
              "important"
            );
          }
        }
      }
    }
  }

  function resizeSpinner() {
    SGPMSpinner.init(popupId, hashId, true);
  }

  function setOpenAnimation() {
    contentDiv.style.animationTimingFunction = "linear";
    var border = 0;
    var padding = 0;
    if (openAnimation.type == "slideleft") {
      var start =
        window.innerWidth - parseInt(contentDiv.style.left) + 2 * border;
      addAnimationClass(
        OPEN_ANIMATION_SLIDELEFT.replace(/\{start\}/g, start + "px")
      );
      contentDiv.style.animationName = "slideinfromright";
    } else if (openAnimation.type == "slideright") {
      var start =
        parseInt(mainDiv.style.width) +
        parseInt(contentDiv.style.left) +
        2 * border +
        2 * padding;
      addAnimationClass(
        OPEN_ANIMATION_SLIDERIGHT.replace(/\{start\}/g, "-" + start + "px")
      );
      contentDiv.style.animationName = "slideinfromleft";
    } else if (openAnimation.type == "pop") {
      addAnimationClass(OPEN_ANIMATION_POP);
      contentDiv.style.transform = "scale(1)";
      contentDiv.style.animationName = "popin";
      contentDiv.style.opacity = "1";
    } else if (openAnimation.type == "fade") {
      addAnimationClass(OPEN_ANIMATION_FADE);
      contentDiv.style.animationName = "fadein";
      contentDiv.style.opacity = "1";
    } else if (openAnimation.type == "flip") {
      addAnimationClass(OPEN_ANIMATION_FLIP);
      contentDiv.style.animationName = "flipintoright";
      contentDiv.style.transform = "translateX(0)";
    } else if (openAnimation.type == "turn") {
      addAnimationClass(OPEN_ANIMATION_FLIP);
      contentDiv.style.animationName = "flipintoright";
      contentDiv.style.transform = "translateX(0)";
      contentDiv.style.transformOrigin = "0";
    } else if (openAnimation.type == "flow") {
      addAnimationClass(OPEN_ANIMATION_FLOW);
      contentDiv.style.animationName = "flowinfromright";
      contentDiv.style.transformOrigin = "50% 30%";
    } else if (openAnimation.type == "slideup") {
      var bottom = 0;
      if (contentDiv.style.bottom) {
        bottom =
          parseInt(mainDiv.offsetHeight) +
          2 * border +
          parseInt(contentDiv.style.bottom) +
          2 * padding;
      } else {
        bottom =
          window.innerHeight - parseInt(contentDiv.style.top) + 2 * border;
      }
      var start = bottom;
      addAnimationClass(
        OPEN_ANIMATION_SLIDEUP.replace(/\{start\}/g, start + "px")
      );
      contentDiv.style.animationName = "slideinfrombottom";
    } else if (openAnimation.type == "slidedown") {
      var top = 0;
      if (contentDiv.style.top) {
        top = parseInt(contentDiv.style.top) + 2 * border + 2 * padding;
      } else {
        top =
          window.innerHeight -
          parseInt(contentDiv.style.bottom) -
          parseInt(mainDiv.offsetHeight);
      }
      var start = top + parseInt(mainDiv.style.height || mainDiv.offsetHeight);
      addAnimationClass(
        OPEN_ANIMATION_SLIDEDOWN.replace(/\{start\}/g, "-" + start + "px")
      );
      contentDiv.style.animationName = "slideinfromtop";
    }
    contentDiv.style.animationDuration = openAnimation.speed + "ms";
  }

  function setCloseAnimation() {
    contentDiv.style.animationTimingFunction = "linear";
    var border = 0;
    var padding = 0;
    if (closeAnimation.type == "slideleft") {
      var end =
        parseInt(mainDiv.style.width) +
        parseInt(contentDiv.style.left) +
        2 * border +
        2 * padding;
      addAnimationClass(
        CLOSE_ANIMATION_SLIDELEFT.replace(/\{end\}/g, "-" + end + "px")
      );
      contentDiv.style.animationName = "slideouttoleft";
    } else if (closeAnimation.type == "slideright") {
      var end =
        window.innerWidth - parseInt(contentDiv.style.left) + 2 * border;
      addAnimationClass(
        CLOSE_ANIMATION_SLIDERIGHT.replace(/\{end\}/g, end + "px")
      );
      contentDiv.style.animationName = "slideouttoright";
    } else if (closeAnimation.type == "pop") {
      addAnimationClass(CLOSE_ANIMATION_POP);
      contentDiv.style.animationName = "popout";
      contentDiv.style.transform = "scale(0)";
      contentDiv.style.opacity = "0";
    } else if (closeAnimation.type == "fade") {
      addAnimationClass(CLOSE_ANIMATION_FADE);
      contentDiv.style.animationName = "fadeout";
      contentDiv.style.opacity = "0";
    } else if (closeAnimation.type == "flip") {
      addAnimationClass(CLOSE_ANIMATION_FLIP);
      contentDiv.style.animationName = "flipouttoright";
      contentDiv.style.transform = "rotateY(-90deg) scale(.9)";
    } else if (closeAnimation.type == "turn") {
      addAnimationClass(CLOSE_ANIMATION_FLIP);
      contentDiv.style.animationName = "flipouttoright";
      contentDiv.style.transform = "rotateY(-90deg) scale(.9)";
      contentDiv.style.transformOrigin = "0";
    } else if (closeAnimation.type == "flow") {
      addAnimationClass(CLOSE_ANIMATION_FLOW);
      contentDiv.style.animationName = "flowouttoright";
      contentDiv.style.transformOrigin = "50% 30%";
    } else if (closeAnimation.type == "slideup") {
      var top = 0;
      if (contentDiv.style.top) {
        top = parseInt(contentDiv.style.top) + 2 * border + 2 * padding;
      } else {
        top =
          window.innerHeight -
          parseInt(contentDiv.style.bottom) -
          parseInt(mainDiv.offsetHeight);
      }
      var end = top + parseInt(mainDiv.style.height || mainDiv.offsetHeight);
      addAnimationClass(
        CLOSE_ANIMATION_SLIDEUP.replace(/\{end\}/g, "-" + end + "px")
      );
      contentDiv.style.animationName = "slideouttotop";
    } else if (closeAnimation.type == "slidedown") {
      var bottom = 0;
      if (contentDiv.style.bottom) {
        bottom =
          parseInt(mainDiv.offsetHeight) +
          2 * border +
          parseInt(contentDiv.style.bottom) +
          2 * padding;
      } else {
        bottom =
          window.innerHeight - parseInt(contentDiv.style.top) + 2 * border;
      }
      var end = bottom;
      addAnimationClass(
        CLOSE_ANIMATION_SLIDEDOWN.replace(/\{end\}/g, end + "px")
      );
      contentDiv.style.animationName = "slideouttobottom";
    }
    contentDiv.style.animationFillMode = "forwards";
    contentDiv.style.animationDuration = closeAnimation.speed + "ms";

    /* remove close animation style after close popup */
    window.setTimeout(function () {
      var effectStyleElement = document.getElementById(
        "sgpm-effect-custom-style"
      );
      effectStyleElement.parentNode.removeChild(effectStyleElement);
      contentDiv.style.animationName = "";
      contentDiv.style.transform = "";
      contentDiv.style.transformOrigin = "";
      contentDiv.style.opacity = "";
    }, parseInt(closeAnimation.speed) + 10);
  }

  function setOpenEvents() {
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      switch (event.type) {
        case "load":
          setOpenOnLoadEvent();
          break;
        case "click":
          setOpenOnClickEvent(event);
          break;
        case "hover":
          setOpenOnHoverEvent(event);
          break;
        case "scroll":
          setOpenOnScrollEvent(event);
          break;
        case "exit":
          /** add event listener for exit intent with delay */
          var config = event;
          if (parseInt(event.delay) > 0) {
            setTimeout(function () {
              setOpenOnExitEvent(config);
            }, config.delay * 1000);
            break;
          }

          setOpenOnExitEvent(config);
          break;
        case "inactivity":
          setOpenInactivityEvent(event);
      }
    }
  }

  function setOpenOnExitEvent(config) {
    switch (config.mode) {
      case "soft":
        setSoftExitEvents(config);
        break;
      case "agressive1":
        setAgressive1ExitEvents(config);
        break;
      case "agressive2":
        setAgressive2ExitEvents(config);
        break;
      case "agressive3":
        setAgressive3ExitEvents(config);
        break;
      case "full":
        setFullExitEvents(config);
        break;
    }

    // for mobile
    if (
      (config.mobile == "on" || typeof config.mobile === "undefined") &&
      (SGP.iSMobile() || SGP.iSTablet())
    ) {
      setExitIntentForMobile();
    }
  }

  /** IE browser detection */
  function setEventListener(element, eventName, fn) {
    if (element.addEventListener) {
      element.addEventListener(eventName, fn, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + eventName, fn);
    }
  }

  function setExitIntentForMobile() {
    var pageUrlInit = window.location.href;

    if (window.history.state == null) {
      window.history.pushState(
        {
          popupmaker: "exit-intent",
        },
        ""
      );
    }

    window.onpopstate = function () {
      var pageUrlNew = window.location.href;
      var urlSplit = pageUrlNew.split("#");
      var url = urlSplit[0];

      var areEqual = pageUrlInit.localeCompare(url) == 0 ? true : false;

      if (pageUrlNew.indexOf("#") == -1 && areEqual) {
        openPopup(false, "onExit");
      }
    };

    var visibilitychange = function (e) {
      openPopup(false, "onExit");
      document.removeEventListener("visibilitychange", visibilitychange);
    };
    document.addEventListener("visibilitychange", visibilitychange);
  }

  function setAgressive1ExitEvents(config) {
    window.addEventListener("beforeunload", function (e) {
      (e || window.event).returnValue = config.message;
      return config.message;
    });
  }

  function setAgressive2ExitEvents(config) {
    window.addEventListener("beforeunload", function (e) {
      openPopup(false, "onExit");
      e.returnValue = config.message;
      return config.message;
    });
  }

  function setAgressive3ExitEvents() {
    var pageUrlInit = window.location.href;

    if (window.history.state == null) {
      window.history.pushState(
        {
          popupmaker: "exit-intent",
        },
        ""
      );
    }

    window.onpopstate = function () {
      var pageUrlNew = window.location.href;
      var urlSplit = pageUrlNew.split("#");
      var url = urlSplit[0];

      var areEqual = pageUrlInit.localeCompare(url) == 0 ? true : false;

      if (pageUrlNew.indexOf("#") == -1 && areEqual) {
        openPopup(false, "onExit");
      }
    };
  }

  function setFullExitEvents(config) {
    setSoftExitEvents(config);
    setAgressive2ExitEvents(config);
  }

  function setSoftExitEvents(config) {
    var elementsToExcude = ["input", "radio", "checkbox", "select"];
    var browser = detectUserBrowser();

    var exitEventFunction = function (e) {
      if (browser[0] == "Firefox" || "IE" || "Edge") {
        if (e.relatedTarget == null) {
          /* prevent from triggering on html form elements click */
          if (elementsToExcude.indexOf(e.target.localName) > -1) return;

          var e = e ? e : window.event;
          /*If this is an autocomplete element.*/
          if (e.target.tagName.toLowerCase() == "input") {
            return;
          }
          /*Get the current viewport width.*/
          var vpWidth = Math.max(
            document.documentElement.clientWidth,
            window.innerWidth || 0
          );
          /*If the current mouse X position is within 50px of the right edge of the viewport, return.*/
          if (e.clientX >= vpWidth - 50) {
            return;
          }
          /*If the current mouse Y position is not within 50px of the top edge of the viewport, return.*/
          if (e.clientY >= 50) return;
          /*Reliable, works on mouse exiting window and user switching active program*/
          var switchingActiveProgram = e.relatedTarget || e.toElement;

          if (!switchingActiveProgram) {
            openPopup(false, "onExit");
            document.removeEventListener("mouseout", exitEventFunction);
          }
        }
      } else {
        if (e.toElement == null && e.relatedTarget == null) {
          var e = e ? e : window.event;
          /*If this is an autocomplete element.*/
          if (e.target.tagName.toLowerCase() == "input") {
            return;
          }
          /*Get the current viewport width.*/
          var vpWidth = Math.max(
            document.documentElement.clientWidth,
            window.innerWidth || 0
          );
          /*If the current mouse X position is within 50px of the right edge of the viewport, return.*/
          if (e.clientX >= vpWidth - 50) {
            return;
          }
          /*If the current mouse Y position is not within 50px of the top edge of the viewport, return.*/
          if (e.clientY >= 50) return;
          /*Reliable, works on mouse exiting window and user switching active program*/
          var switchingActiveProgram = e.relatedTarget || e.toElement;

          if (!switchingActiveProgram) {
            openPopup(false, "onExit");
            document.removeEventListener("mouseout", exitEventFunction);
          }
        }
      }
    };

    /** add event listener for exit intent */
    setEventListener(document, "mouseout", exitEventFunction);
  }

  function detectUserBrowser() {
    var ua = navigator.userAgent,
      tem,
      M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return "IE " + (tem[1] || "");
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M;
  }

  function setOpenOnLoadEvent() {
    if (document.readyState === "complete") {
      //Already loaded!
      setTimeout(function () {
        openPopup(false, "onLoad");
      }, openDelay * 1000);
    } else {
      //Add onload or DOMContentLoaded event listeners here: for example,
      window.addEventListener(
        "load",
        function () {
          setTimeout(function () {
            openPopup(false, "onLoad");
          }, openDelay * 1000);
        },
        false
      );
      //or
      //document.addEventListener("DOMContentLoaded", function () {/* code */}, false);
    }
  }

  function setOpenOnLoadRepetitiveEvent(timeout) {
    /** repeat popup after timeout */
    repetitiveDelay = setTimeout(function () {
      openPopup(false, "onLoad");
    }, timeout * 1000);
  }

  function setOpenOnClickEvent(config) {
    var target = config.target;
    if (!target) {
      return;
    }

    var addOnClickEventToElement = function (event) {
      if (!event.target.getAttribute("data-sgpm-do-not-prevent-default")) {
        event.preventDefault();
      }
      openPopup(false, "onClick");
    };

    var elements = "";

    /* for old user*/
    if (typeof target === "string") {
      try {
        elements = document.querySelectorAll("" + target + "");

        for (var i = 0; i < elements.length; i++) {
          elements[i].addEventListener("click", function (event) {
            event.preventDefault();
            openPopup(false, "onClick");
          });

          elements[i].classList.add("sgpm-elements-cursor-pointer");
        }
      } catch (err) {
        return;
      }
    } else {
      try {
        for (var i = 0; i < target.length; i++) {
          elements = document.querySelectorAll("" + target[i].target + "");

          for (var j = 0; j < elements.length; j++) {
            elements[j].addEventListener("click", addOnClickEventToElement);
            elements[j].classList.add("sgpm-elements-cursor-pointer");

            if (target[i].doNotPreventDefault) {
              elements[j].setAttribute(
                "data-sgpm-do-not-prevent-default",
                true
              );
            }
          }
        }
      } catch (err) {
        return;
      }
    }
  }

  function setOpenOnHoverEvent(config) {
    var target = config.target;
    if (!target) {
      return;
    }

    var elements = "";

    try {
      elements = document.querySelectorAll("" + target + "");
    } catch (err) {
      return;
    }

    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener("mouseover", function () {
        openPopup(false, "onHover");
      });

      elements[i].classList.add("sgpm-elements-cursor-pointer");
    }
  }

  function setOpenOnScrollEvent(config) {
    var scrollPos = parseInt(config.position);
    if (config.position.indexOf("%") > 0) {
      scrollPos =
        document.body.scrollHeight * (scrollPos / 100) - window.innerHeight / 2;
    }
    var scrollEventFunction = function () {
      if (
        document.body.scrollTop >= scrollPos ||
        document.documentElement.scrollTop >= scrollPos
      ) {
        openPopup(false, "onScroll");
        window.removeEventListener("scroll", scrollEventFunction);
      }
    };

    if (parseInt(config.delay) > 0) {
      setTimeout(function () {
        window.addEventListener("scroll", scrollEventFunction);
      }, config.delay * 1000);
      return;
    }

    window.addEventListener("scroll", scrollEventFunction);
  }

  function setOpenInactivityEvent(config) {
    var timer;
    var handler = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        openPopup(false, "inactivity");
        clearInterval(timer);
        document.removeEventListener("mousemove", handler);
        document.removeEventListener("mousedown", handler);
        document.removeEventListener("keydown", handler);
        document.removeEventListener("scroll", handler);
      }, config.timeout * 1000);
    };
    document.addEventListener("mousemove", handler);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    document.addEventListener("scroll", handler);

    handler();
  }

  function initPopup() {
    
    DIV = document.createElement("div");
    mainDiv = document.createElement("div");
    mainDiv.classList.add("sgpm-popup-maker-wrapper");
    var sizeConfig = getSizeConfig();

    contentDiv = document.createElement("div");
    closeButtonOverlay = document.createElement("div");
    closeButtonImage = document.createElement("IMG");
    setMainDivStyles(sizeConfig);
    setBackground();
    if (contentBox.addClass) {
      var mainDivClassList = mainDiv.className;
      var newClassNameList = mainDivClassList + " " + contentBox.addClass;

      mainDiv.className = newClassNameList;
    }
    DIV.style.display = "none";
    contents = replaceVariablesInContent(contents);
    mainDiv.innerHTML =
      '<div style="height:100%;width:100%;' +
      (contentBox.scrollingEnabled ? "" : "overflow:hidden") +
      '">' +
      contents +
      "</div>";

    // Création des éléments nécessaires
    contentDiv.appendChild(closeButtonOverlay);
    contentDiv.appendChild(closeButtonImage);
    contentDiv.appendChild(mainDiv);

    // Affichage du branding si nécessaire
    if (displayBranding == "on" || displayBranding.enabled == "on") {
      var brandingPanel = SGP.getBrandingPanel(contentBox, displayBranding);
      contentDiv.appendChild(brandingPanel);
    }

    // Ajout des éléments au DOM
    DIV.appendChild(contentDiv);
    document.body.appendChild(DIV);

    // Initialisation des comportements et événements
    initPopupFromPopup();
    isInited = true;
    setOpenEvents();
    setContentClickBehavior();
    initFloatingButton();

  }

  function initFloatingButton() {
    if (floatingButton.params.style == "off") return;

    if (shouldOpen) {
      if (typeof shouldOpen == "function") {
        shouldOpen();
      } else if (typeof eval(shouldOpen) == "function") {
        if (!eval(shouldOpen)(openBehavior, isEnabledPopup, hashId, mainDiv))
          return;
      }
    }

    if (floatingButton.action == "openPopup") {
      floatingButton.action = SGPMPopupLoader.popups[hashId].open;
      floatingButton.actionParams = [];
      floatingButton.actionParams["forced"] = true;
      floatingButton.actionParams["eventName"] = "clickOnFloatingButton";
    }
    var sgpmFloatingButton = new SGPMFloatingButton();
    sgpmFloatingButton.init(floatingButton, hashId);
    sgpmFloatingButton.calculateFloatingButtonPosition();

    var rtime;
    var timeout = false;
    var delta = 2;
    window.addEventListener("resize", function () {
      rtime = new Date();
      if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
      }

      function resizeend() {
        if (new Date() - rtime < delta) {
          setTimeout(resizeend, delta);
        } else {
          timeout = false;
          sgpmFloatingButton.calculateFloatingButtonPosition();
        }
      }
    });
  }

  function initPopupFromPopup() {
    if (typeof SGPMPopupLoader === "undefined") return;

    var contentDiv = document.createElement("div");

    contentDiv.innerHTML = contents;
    var buttonElements = contentDiv.querySelectorAll(
      '[data-sgpopuptype = "FEButtonElement"]'
    );
    var subscriptionForms = contentDiv.querySelectorAll(
      '[data-sgpopuptype = "FESubscriptionPopup"]'
    );

    if (buttonElements.length) {
      var pid = [];
      for (var i = 0; i < buttonElements.length; i++) {
        var buttonElement =
          buttonElements[i].querySelector(".sg-button-element");
        var buttonBehavior = buttonElement.getAttribute("data-sg-btn-behavior");

        if (buttonBehavior == "openPopup") {
          var openPopupId = buttonElement.getAttribute("data-sg-open-popup-id");

          if (SGPMPopupLoader.ids.indexOf(openPopupId) < 0) {
            SGPMPopup.openSGPMPopup(openPopupId);
          }
        }
      }
    }

    if (subscriptionForms.length) {
      for (var i = 0; i < subscriptionForms.length; i++) {
        var subscriptionForm = subscriptionForms[i];
        if (subscriptionForm) return;

        var pid = subscriptionForms[i].getAttribute("data-pid");
        var customOptionsData = subscriptionForm.querySelector(
          ".sgpm-subscription-custom-option-data-" + pid
        );
        var subscriptionFormBehavior = customOptionsData.getAttribute(
          "data-after-subscribe-behavior"
        );

        if (subscriptionFormBehavior == "openPopup") {
          var openPopupId = subscriptionForm
            .querySelector(".sgpm-subscription-custom-option-data-" + pid)
            .getAttribute("data-sg-open-popup-id");

          if (SGPMPopupLoader.ids.indexOf(openPopupId) < 0) {
            SGPMPopup.openSGPMPopup(openPopupId);
          }
        }
      }
    }
  }

  function replaceVariablesInContent(content) {
    var replaceFunc = function (str, offset, string) {
      var variable = str.replace("{{", "").replace("}}", "");
      if (!variable) {
        return str;
      }

      var elementsArr = variable.split("|");
      if (!elementsArr[0] || !elementsArr[1] || !elementsArr[3]) {
        return str;
      }
      var selectorType = elementsArr[0];
      var selectorStr = elementsArr[1].replace("%7C", "|");
      var attribute = elementsArr[2];
      var defaultValue = elementsArr[3];

      var selector = "";
      var selectors = {
        id: "#{selector}",
        class: ".{selector}",
        custom: "{selector}",
      };

      selector = selectors[selectorType].replace("{selector}", selectorStr);
      var elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (err) {}

      if (!elements.length) {
        return defaultValue;
      }

      if (!attribute) {
        return elements[0].innerHTML;
      }
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].hasAttribute(attribute)) {
          return elements[i].getAttribute(attribute);
        }
      }
      return defaultValue;
    };

    return content.replace(/(\{\{)(.*?)(\}\})/gi, replaceFunc);
  }

  function openPopup(forced, action) {
    if (opened) {
      return;
    }

    /**
     * delete repetitve delay after opening popup
     * will not trigger on first opening
     */
    if (typeof repetitiveDelay !== "undefined") {
      clearTimeout(repetitiveDelay);
    }

    if (!forced) {
      var cookieValue = SGPMPopup.getCookie("sgpm-" + hashId);
      var cookieValuePush = SGPMPopup.getCookie(
        "sgpm-push-notification-" + hashId
      );
      var cookieValueSubscription = SGPMPopup.getCookie(
        "sgpm-subscription-" + hashId
      );
      var cookieValueAgeRestriction = SGPMPopup.getCookie(
        "sgpm-age-restriction-" + hashId
      );
      var cookieValueSpinner = SGPMPopup.getCookie("sgpm-spinner-" + hashId);
      var cookieValueMailchimp = SGPMPopup.getCookie(
        "sgpm-mailchimp-" + hashId
      );
      var buttonClicked = SGPMPopup.getCookie("sgpm-button-clicked-" + hashId);

      if (cookieValue) {
        var selectors = JSON.parse(showingFrequency.selectors);
        var cookieData = JSON.parse(cookieValue);

        if (!selectors) {
          return;
        }
        if (cookieData.opened >= selectors.count) {
          return;
        }
      }

      if (
        cookieValuePush ||
        cookieValueSubscription ||
        cookieValueAgeRestriction ||
        cookieValueSpinner ||
        cookieValueMailchimp ||
        buttonClicked
      ) {
        return;
      }

      if (shouldOpen) {
        if (typeof shouldOpen == "function") {
          shouldOpen();
        } else if (typeof eval(shouldOpen) == "function") {
          if (!eval(shouldOpen)(openBehavior, isEnabledPopup, hashId, mainDiv))
            return;
        }
      }
    }

    if (!isInited) {
      initPopup();
    }

    var self = this;

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      setTimeout(onWindowRsize, 20);
    });

    if (willOpen && typeof willOpen == "function") {
      willOpen();
    }
    drawOverlay();

    DIV.style.display = "block";
    positionPopup();
    setOpenAnimation();

    setCloseButton(mainDiv);
    resizeLayout();
    onWindowRsize();
    opened = true;
    if (didOpen) {
      if (typeof didOpen == "function") {
        didOpen();
      } else if (typeof eval(didOpen) == "function") {
        eval(didOpen)(
          action,
          integrations,
          popupId,
          popupName,
          mainDiv,
          hashId,
          showingFrequency,
          disablePageScrolling
        );
      }
      countdownResponsibility(mainDiv);
    }

    if (closeBehavior.autoclose && closeBehavior.autoclose > 0) {
      setTimeout(closePopup, closeBehavior.autoclose * 1000);
    }

    if (closeBehavior.escShouldClose) {
      document.onkeydown = function (e) {
        e = e || window.event;
        if (e.keyCode == 27) {
          // esc pressed
          closePopup();
        }
      };
    } else {
      document.onkeydown = function (e) {
        e = e || window.event;
        if (e.keyCode == 27) {
          // esc pressed
          return;
        }
      };
    }
  }

  function closePopup(forced) {
    if (!forced) {
      if (shouldClose && typeof shouldClose == "function") {
        if (!shouldClose()) {
          return;
        }
      }
    }
    if (closeBehavior.allowed === false && forced !== true) {
      return;
    }
    if (willClose && typeof willClose == "function") {
      willClose();
    }

    window.removeEventListener("resize", onWindowRsize);
    var closeFunction = function () {
      if (!DIV) {
        return;
      }
      DIV.style.display = "none";
      //document.body.removeChild(DIV);
      //DIV = null;
      //closeButtonImage = null;
      //mainDiv = null;
      removeOverlay();
      if (didClose && typeof didClose == "function") {
        didClose();
        opened = false;
        //isInited = false;
      }

      if (didClose) {
        if (typeof didClose == "function") {
          didClose();
        } else if (typeof eval(didClose) == "function") {
          eval(didClose)(mainDiv, popupId, disablePageScrolling, hashId);
        }
        opened = false;

        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          if (event.type == "load" && event.repetitive) {
            setOpenOnLoadRepetitiveEvent(event.repetitiveDelay);
          }
        }
      }
    };
    if (closeAnimation.type != "none" && closeAnimation.speed > 0) {
      setCloseAnimation();
      setTimeout(closeFunction, closeAnimation.speed);
    } else {
      closeFunction();
    }
  }

  var resizeBox = function () {
    var sizeConfig = getSizeConfig();
    setMainDivStyles(sizeConfig);
  };

  this.open = function (forced, action) {
    openPopup(forced, action);
  };

  this.init = function () {
    initPopup();
  };

  this.close = function (forced) {
    closePopup(forced);
  };

  this.resize = function () {
    resizeBox();
  };

  this.setOpenDelay = function (delay) {
    openDelay = delay;
    if (isInited) {
      initPopup();
    }
  };
  this.getOpenDelay = function () {
    return openDelay;
  };

  this.setDisplayBranding = function (displayBrand) {
    displayBranding = displayBrand;
    if (isInited) {
      initPopup();
    }
  };

  this.getDisplayBranding = function () {
    return displayBranding;
  };

  this.setIsInited = function (isInitedPopup) {
    isInited = isInitedPopup;
  };

  this.getIsInited = function () {
    return isInited;
  };

  this.countdownResponsibility = function () {
    countdownResponsibility();
  };

  this.setOpenAnimation = function (animation) {
    openAnimation = animation;
    if (isInited) {
      initPopup();
    }
  };

  this.getOpenAnimation = function () {
    return openAnimation;
  };

  this.setCloseAnimation = function (animation) {
    closeAnimation = animation;
    if (isInited) {
      initPopup();
    }
  };

  this.getCloseAnimation = function () {
    return closeAnimation;
  };

  this.setCloseBehavior = function (config) {
    closeBehavior = config;
    if (isInited) {
      initPopup();
    }
  };

  this.getCloseBehavior = function () {
    return closeBehavior;
  };

  this.setCloseButton = function (button) {
    closeButton = button;
  };

  this.getCloseButton = function () {
    return closeButton;
  };

  this.setOverlay = function (config) {
    overlay = config;
    if (isInited) {
      initPopup();
    }
  };

  this.getOverlay = function () {
    return overlay;
  };

  this.setContentBox = function (config) {
    contentBox = config;
    if (isInited) {
      initPopup();
    }
  };

  this.getContentBox = function () {
    return contentBox;
  };

  this.setContents = function (content) {
    contents = content;
    if (isInited) {
      initPopup();
    }
  };

  this.getContents = function () {
    return contents;
  };

  this.setPosition = function (config) {
    position = config;
  };

  this.getPosition = function () {
    return position;
  };

  this.setSizingRanges = function (ranges) {
    sizingRanges = ranges;
    if (isInited) {
      initPopup();
    }
  };

  this.getSizingRanges = function () {
    return sizingRanges;
  };

  this.setShouldOpen = function (func) {
    shouldOpen = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getShouldOpen = function () {
    return shouldOpen;
  };

  this.setWillOpen = function (func) {
    willOpen = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getWillOpen = function () {
    return willOpen;
  };

  this.setDidOpen = function (func) {
    didOpen = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getDidOpen = function () {
    return didOpen;
  };

  this.setShouldClose = function (func) {
    shouldClose = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getShouldClose = function () {
    return shouldClose;
  };

  this.setWillClose = function (func) {
    willClose = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getWillClose = function () {
    return willClose;
  };

  this.setDidClose = function (func) {
    didClose = func;
    if (isInited) {
      initPopup();
    }
  };

  this.getDidClose = function () {
    return didClose;
  };
}

SGPMPopup.sendGetRequest = function (url, responseHandler, params) {
  var req;
  if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = function () {
    if (req.readyState == 4) {
      // only if req shows "loaded"
      if (req.status < 400) {
        // only if "OK"
        responseHandler(req, params);
      } else {
        //alert("There was a problem loading data :\n" + req.status+ "/" + req.statusText);
      }
    }
  };
  req.open("GET", url, true);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.send(null);
};

SGPMPopup.isCookieExist = function (cname, cookiePageLevel) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return true;
    }
  }

  return "";
};

SGPMPopup.getCookie = function (cname, cookiePageLevel) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      var value = c.substring(name.length, c.length);
      var cvalue = {};
      if (value) {
        try {
          cvalue = JSON.parse(value);
        } catch (e) {
          cvalue = value;
        }
      }

      if (cvalue.pageLevel) {
        if (cvalue.currentPage == window.location.href) {
          c = JSON.parse(c.substring(name.length, c.length));
          delete c.currentPage; /* unset currentPage: key */

          return JSON.stringify(c);
        }
      } else {
        return c.substring(name.length, c.length);
      }
    }
  }

  return "";
};

/* remove subdomain using existing patterns */
SGPMPopup.removeSubdomain = function (str) {
  var firstTLDs =
    "ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt".split(
      "|"
    );

  var secondTLDs =
    "com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|åŒ—æµ·é“|å’Œæ­Œå±±|ç¥žå¥ˆå·|é¹¿å…å³¶|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flÃ¥|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|Ð¾Ñ€Ð³|Ð¾Ð±Ñ€|ÑƒÐ¿Ñ€|alt|nis|jpn|mex|ath|iki|nid|gda|inc".split(
      "|"
    );

  str = str.replace(/^www\./, "");
  var parts = str.split(".");

  while (parts.length > 3) {
    parts.shift();
  }

  if (
    parts.length === 3 &&
    ((parts[1].length > 2 && parts[2].length > 2) ||
      (secondTLDs.indexOf(parts[1]) === -1 &&
        firstTLDs.indexOf(parts[2]) === -1))
  ) {
    parts.shift();
  }

  return parts.join(".");
};

SGPMPopup.setCookieObject = function (cname, cvalue, exdays, path, sameOrigin) {
  var domain = "";
  var sameSite = "Lax";

  if (sameOrigin) {
    var fullDomain = window.location.hostname;

    domain = SGPMPopup.removeSubdomain(fullDomain);
    domain = "domain = " + domain + "; ";
  }

  if (exdays === 0) {
    document.cookie =
      cname +
      "=" +
      cvalue +
      "; expires = 0; " +
      domain +
      "path = " +
      path +
      "; SameSite=" +
      sameSite;
    return;
  }

  var exdate = new Date();
  if (!exdays || isNaN(exdays)) {
    exdays = 365 * 50;
  }

  exdate.setDate(exdate.getDate() + exdays);
  var value =
    cvalue +
    (exdays == null
      ? ";"
      : "; expires=" +
        exdate.toUTCString() +
        "; " +
        domain +
        "path = " +
        path +
        "; SameSite=" +
        sameSite);
  document.cookie = cname + "=" + value;
};

SGPMPopup.setLocalStorage = function (key, value) {
  var storageVal = "";
  if (typeof value === "object") {
    storageVal = SGPMPopup.getLocalStorage(key);
    if (!storageVal || typeof storageVal !== "object") {
      storageVal = {};
    }

    for (var objKey in value) {
      storageVal[objKey] = value[objKey];
    }

    storageVal = JSON.stringify(storageVal);
  } else {
    storageVal = value;
  }

  localStorage.setItem(key, storageVal);
};

SGPMPopup.getLocalStorage = function (key) {
  var storageObject = "";

  try {
    storageObject = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    storageObject = localStorage.getItem(key);
  }

  return storageObject;
};

SGPMPopup.setCookie = function (cname, cvalue, exdays, selectors, sameOrigin) {
  var existingCookieData = SGPMPopup.getCookie(cname);
  var openedCount = 1;

  if (existingCookieData) {
    var obj = JSON.parse(existingCookieData);

    if (selectors) {
      openedCount = obj.opened + 1;
    }
  }

  if (cvalue) {
    cvalue = {
      opened: 1,
      pageLevel: "",
    };
    var path = "/";
    if (selectors && selectors.pageLevel) {
      path = window.location.href;
      cvalue.pageLevel = "true";
      cvalue.currentPage = path;
    }
    if (selectors) {
      cvalue.opened = openedCount;
    }
    cvalue = JSON.stringify(cvalue);
  }

  SGPMPopup.setCookieObject(cname, cvalue, exdays, path, sameOrigin);
};

SGPMPopup.getPopup = function (el) {
  var hashId = null;
  while (el && el != document) {
    if (
      el.parentNode &&
      el.parentNode.classList.contains("sgpm-popup-maker-wrapper")
    ) {
      var popupMainWrapper = el.parentNode;
      hashId = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-popup-hash-id");
      break;
    }
    el = el.parentNode;
  }

  if (hashId) {
    return SGPMPopupLoader.popups[hashId];
  }
};

SGPMPopup.openSGPMPopup = function (id) {
  /* filter all duplicate ids and store one from each */
  var ids = id
    ? [id]
    : SGPMPopupLoader.ids.filter(function (item, pos) {
        return SGPMPopupLoader.ids.indexOf(item) == pos;
      });

  /* load css */
  var linkTag = document.createElement("link");
  linkTag.rel = "stylesheet";
  linkTag.type = "text/css";
  linkTag.href = SGPM_APP_URL + "public/assets/lib/SGPMPopup.css";
  document.head.appendChild(linkTag);
  /*  */

  var responseFunction = function (response, id) {
    if (!response.responseText) {
      return;
    }

    var result = JSON.parse(response.responseText);

    if (typeof result.errors === "undefined") {
      var popup = new SGPMPopup(result);
      SGPMPopupLoader.popups[id] = popup;
      popup.init();
    }
  };

  var cookieValue = "";
  var cookieValuePush;
  var cookieValueSubscription;
  var cookieValueAgeRestriction;
  var cookieValueSpinner;
  var cookieValueMailchimp;

  for (var i = 0; i < ids.length; i++) {
    cookieValuePush = SGPMPopup.getCookie("sgpm-push-notification-" + ids[i]);
    cookieValueSubscription = SGPMPopup.getCookie(
      "sgpm-subscription-" + ids[i]
    );
    cookieValueAgeRestriction = SGPMPopup.getCookie(
      "sgpm-age-restriction-" + ids[i]
    );
    cookieValueSpinner = SGPMPopup.getCookie("sgpm-spinner-" + ids[i]);
    cookieValueMailchimp = SGPMPopup.getCookie("sgpm-mailchimp-" + ids[i]);

    if (
      cookieValuePush ||
      cookieValueSubscription ||
      cookieValueAgeRestriction ||
      cookieValueSpinner ||
      cookieValueMailchimp
    ) {
      continue;
    }

    cookieValue = SGPMPopup.getCookie("sgpm-" + ids[i]);
    SGPMPopup.sendGetRequest(
      SGPM_APP_URL + "api/v1/popup/show/" + ids[i] + "/" + cookieValue,
      responseFunction,
      ids[i]
    );
  }
};

////////////////////////////////////////////////////////////////////////////////////////

// SGP Class
function SGP() {}

SGP.afterFBPageLiked = function (url, htmlElement, popupId) {
  if (!popupId) {
    var popupId = SGPM_POPUP_ID;
    var popupMainWrapper = "";
    if (htmlElement) {
      while (htmlElement.parentNode) {
        if (htmlElement.parentNode === document) {
          break;
        }

        if (
          htmlElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")
        ) {
          popupMainWrapper = htmlElement.parentNode;
          popupId = popupMainWrapper
            .querySelector("[data-sgpm-popup-id]")
            .getAttribute("data-sgpm-popup-id");
          break;
        }
        htmlElement = htmlElement.parentNode;
      }
    }
    htmlElement = popupMainWrapper.querySelector(".sgpm-facebook-page-content");
  } else {
    htmlElement = document
      .querySelector('[data-sgpm-popup-id="' + popupId + '"]')
      .parentNode.querySelector(".sgpm-facebook-page-content");
  }

  if (SGPM_POPUP_STATISTICS[popupId]) {
    SGPM_POPUP_STATISTICS[popupId].trackAction("Like", "Facebook Page Element");
  }

  var behaviorOption = htmlElement.getAttribute("data-sgpm-fb-like-behavior");
  var redirectionUrl = htmlElement.getAttribute("data-sgpm-redirect-url");
  var redirectionNewTab = +htmlElement.getAttribute(
    "data-sgpm-redirect-new-tab"
  );

  switch (behaviorOption) {
    case "redirectUrl":
      if (redirectionNewTab === 1) {
        SGPMPopup.getPopup(htmlElement).close(true);
        window.open(redirectionUrl);
      } else {
        window.location.href = redirectionUrl;
      }
      break;
    case "closePopup":
      SGPMPopup.getPopup(htmlElement).close(true);
      break;
  }
};

SGP.shouldOpenPopup = function (openBehavior, isEnabledPopup, hashId, mainDiv) {
  if (
    openBehavior.spokenLanguages &&
    openBehavior.spokenLanguages.enabled == "on" &&
    !SGP.spokenLanguagesDetection(openBehavior.spokenLanguages)
  ) {
    return false;
  }

  if (
    openBehavior.referralDetection &&
    openBehavior.referralDetection.enabled &&
    openBehavior.referralDetection.urls &&
    !SGP.referralDetection(openBehavior.referralDetection)
  ) {
    return false;
  }

  if (
    openBehavior.afterXPagesVisit &&
    openBehavior.afterXPagesVisit.enabled &&
    !SGP.checkAfterXPagesVisitRule(openBehavior.afterXPagesVisit, hashId)
  ) {
    return false;
  }

  if (
    openBehavior.popupByCustomCookie &&
    openBehavior.popupByCustomCookie.enabled == "on" &&
    !SGP.customCookiesDetection(openBehavior.popupByCustomCookie)
  ) {
    return false;
  }

  if (
    openBehavior.popupDependsOnAnyOtherPopup &&
    openBehavior.popupDependsOnAnyOtherPopup.dependencies &&
    openBehavior.popupDependsOnAnyOtherPopup.enabled == "on" &&
    !SGP.popupDependsOnAnyOtherPopup(openBehavior.popupDependsOnAnyOtherPopup)
  ) {
    return false;
  }

  if (
    openBehavior.showingCount &&
    openBehavior.showingCount.enabled == "on" &&
    openBehavior.showingCount.count > 0 &&
    !SGP.showingCount(openBehavior.showingCount, hashId)
  ) {
    return false;
  }

  if (
    openBehavior.trigger.on == "somePages" &&
    openBehavior.trigger.filters &&
    !SGP.showOnSomePages(openBehavior.trigger.filters)
  ) {
    return false;
  }

  if (isEnabledPopup != 1) {
    return false;
  }

  /*checking if current popup's behavior is push*/
  if (mainDiv.querySelectorAll('[data-sg-btn-behavior="push"]').length > 0) {
    /*checking if the browser supports service workers or push notifications*/
    if (!("Notification" in window) || !("PushManager" in window)) {
      return false;
    }
  }

  return true;
};

SGP.customCookiesDetection = function (customCookies) {
  var cookies = customCookies["cookies"];
  for (var key in cookies) {
    var cookieName = cookies[key].cookieName;
    var isShow = cookies[key].isShow;
    var cookie = SGPMPopup.isCookieExist(cookieName);

    if (cookie) {
      if (!isShow) {
        return false;
      }
    } else {
      if (isShow) {
        return false;
      }
    }
  }
  return true;
};

SGP.spokenLanguagesDetection = function (spokenLanguages) {
  var shouldOpen = false;
  var userLanguage = window.navigator.language;
  var userLanguageRegExp = new RegExp(userLanguage);
  var languages = spokenLanguages.languages;
  var selectedLanguagesAsArray = languages.split(",");

  // langauge detection for desktop and android phones
  var isDesktopOrAndroid =
    userLanguage.indexOf("-") > -1 &&
    ((spokenLanguages.filterType == "include" &&
      selectedLanguagesAsArray.indexOf(userLanguage) > -1) ||
      (spokenLanguages.filterType == "exclude" &&
        selectedLanguagesAsArray.indexOf(userLanguage) < 0));

  // langauge detection for apple mobile devices
  var isAppleMobileDevice =
    userLanguage.indexOf("-") < 0 &&
    ((spokenLanguages.filterType == "include" &&
      languages.search(userLanguageRegExp) > -1) ||
      (spokenLanguages.filterType == "exclude" &&
        languages.search(userLanguageRegExp) < 0));

  if (isDesktopOrAndroid || isAppleMobileDevice) {
    shouldOpen = true;
  }

  return shouldOpen;
};

SGP.popupDependsOnAnyOtherPopup = function (trigger) {
  var shouldOpen = false;
  var dependenciesConditionsArr = [];

  for (var key in trigger.dependencies) {
    /** prevent looping through objects' methods */
    if (!trigger.dependencies.hasOwnProperty(key)) {
      continue;
    }

    var correctCondition = false;
    var popupDependenciesObj = trigger.dependencies[key];
    var popup = "sgpm-storage-" + popupDependenciesObj.hashId;
    var localStorageValue = SGPMPopup.getLocalStorage(popup);

    if (localStorageValue !== null) {
      if (
        localStorageValue.opened &&
        popupDependenciesObj.dependencyType == "has_opened"
      ) {
        correctCondition = true;
      }
    } else {
      if (popupDependenciesObj.dependencyType == "has_not_opened") {
        correctCondition = true;
      }
    }

    dependenciesConditionsArr.push(correctCondition);
  }

  if (dependenciesConditionsArr.every(SGP.isAllDependenciesAreTrue)) {
    shouldOpen = true;
  }

  return shouldOpen;
};

SGP.showOnSomePages = function (filters) {
  var shouldOpen = false;
  var pageUrl = window.location.href;
  var pageUrlWithSlash =
    pageUrl[pageUrl.length - 1] != "/" ? pageUrl + "/" : pageUrl;

  for (var type in filters) {
    if (filters.hasOwnProperty(type)) {
      if (type == "equals" && !SGP.isObjEmpty(filters.equals)) {
        for (var key in filters.equals) {
          if (filters.equals.hasOwnProperty(key)) {
            if (
              pageUrl == filters.equals[key] ||
              pageUrl == filters.equals[key] + "/" ||
              pageUrlWithSlash == filters.equals[key]
            ) {
              shouldOpen = true;
            }
          }
        }
      } else if (type == "contains" && !SGP.isObjEmpty(filters.contains)) {
        for (var key in filters.contains) {
          if (filters.contains.hasOwnProperty(key)) {
            if (pageUrl.indexOf(filters.contains[key]) > -1) {
              shouldOpen = true;
            }
          }
        }
      } else if (type == "startsWith" && !SGP.isObjEmpty(filters.startsWith)) {
        for (var key in filters.startsWith) {
          if (filters.startsWith.hasOwnProperty(key)) {
            if (pageUrl.indexOf(filters.startsWith[key]) == 0) {
              shouldOpen = true;
            }
          }
        }
      }
    }
  }

  if (shouldOpen == false) {
    for (var type in filters) {
      if (filters.hasOwnProperty(type)) {
        if (type == "doesNotEquals" && !SGP.isObjEmpty(filters.doesNotEquals)) {
          shouldOpen = true;
          for (var key in filters.doesNotEquals) {
            if (filters.doesNotEquals.hasOwnProperty(key)) {
              if (
                pageUrl == filters.doesNotEquals[key] ||
                pageUrl == filters.doesNotEquals[key] + "/" ||
                pageUrlWithSlash == filters.doesNotEquals[key]
              ) {
                return false;
              }
            }
          }
        } else if (
          type == "doesNotContains" &&
          !SGP.isObjEmpty(filters.doesNotContains)
        ) {
          shouldOpen = true;
          for (var key in filters.doesNotContains) {
            if (filters.doesNotContains.hasOwnProperty(key)) {
              if (pageUrl.indexOf(filters.doesNotContains[key]) != -1) {
                return false;
              }
            }
          }
        } else if (
          type == "doesNotStartsWith" &&
          !SGP.isObjEmpty(filters.doesNotStartsWith)
        ) {
          shouldOpen = true;
          for (var key in filters.doesNotStartsWith) {
            if (filters.doesNotStartsWith.hasOwnProperty(key)) {
              if (pageUrl.indexOf(filters.doesNotStartsWith[key]) != -1) {
                return false;
              }
            }
          }
        }
      }
    }
  }
  return shouldOpen;
};

SGP.showingCount = function (showingCount, hashId) {
  var shouldOpen = false;
  var localFrequencyObj = SGPMPopup.getLocalStorage(
    "sgpm-storage-" + hashId
  ) || { count: 0 };
  var openedCount = localFrequencyObj.count;

  if (openedCount < showingCount.count) {
    shouldOpen = true;
  }

  return shouldOpen;
};

SGP.isAllDependenciesAreTrue = function (currentValue) {
  return currentValue === true;
};

SGP.referralDetection = function (trigger) {
  var shouldOpen = false;
  var referrerPage = document.referrer;

  for (var type in trigger.urls) {
    /** trigger */
    if (type == "equals") {
      for (var key in trigger.urls.equals) {
        if (referrerPage == trigger.urls.equals[key]) {
          shouldOpen = true;
        }
      }
    }
    if (type == "contains") {
      for (var key in trigger.urls.contains) {
        if (referrerPage.indexOf(trigger.urls.contains[key]) > -1) {
          shouldOpen = true;
        }
      }
    }
    if (type == "startsWith") {
      for (var key in trigger.urls.startsWith) {
        if (referrerPage.indexOf(trigger.urls.startsWith[key]) == 0) {
          shouldOpen = true;
        }
      }
    }
    /** do not trigger */
    if (type == "doesNotEquals") {
      for (var key in trigger.urls.doesNotEquals) {
        if (referrerPage != trigger.urls.doesNotEquals[key]) {
          shouldOpen = true;
        }
      }
    }
    if (type == "doesNotContains") {
      for (var key in trigger.urls.doesNotContains) {
        if (referrerPage.indexOf(trigger.urls.doesNotContains[key]) == -1) {
          shouldOpen = true;
        }
      }
    }
    if (type == "doesNotStartsWith") {
      for (var key in trigger.urls.doesNotStartsWith) {
        if (referrerPage.indexOf(trigger.urls.doesNotStartsWith[key]) == -1) {
          shouldOpen = true;
        }
      }
    }
  }

  return shouldOpen;
};

SGP.checkAfterXPagesVisitRule = function (afterXPagesVisit, hashId) {
  var isAtLeastCount = afterXPagesVisit.isAtLeastCount;
  var sameOriginCookie =
    typeof afterXPagesVisit.sameOriginCookie !== "undefined" &&
    afterXPagesVisit.sameOriginCookie == "on"
      ? true
      : false;

  var visitedPagesCookie = SGPMPopup.getCookie(
    "sgpm-visited-pages-count-" + hashId
  );
  var visitedPages = [];
  if (visitedPagesCookie) {
    visitedPages = JSON.parse(visitedPagesCookie);

    if (visitedPages.length >= isAtLeastCount) {
      return true;
    }
  }

  var urlHash = SGP.getHashCode(window.location.href);
  var url = urlHash.toString();

  if (visitedPages.indexOf(url) < 0) {
    visitedPages.push(url);
  }

  var path = "/";
  var exdays = false;
  cvalue = JSON.stringify(visitedPages);

  if (visitedPages.length == isAtLeastCount) {
    SGPMPopup.setCookieObject(
      "sgpm-visited-pages-count-" + hashId,
      cvalue,
      exdays,
      path,
      sameOriginCookie
    );
    return true;
  } else if (visitedPages.length > isAtLeastCount) {
    return true;
  }

  SGPMPopup.setCookieObject(
    "sgpm-visited-pages-count-" + hashId,
    cvalue,
    exdays,
    path,
    sameOriginCookie
  );
  return false;
};

SGP.getHashCode = function (str) {
  var hash = 0;
  if (str.length == 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; /* Convert to 32bit integer */
  }
  return hash;
};

SGP.isObjEmpty = function (obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
};

SGP.iSMobile = function () {
  return (
    SGP.iSIphone() ||
    SGP.iSIpod() ||
    SGP.iSAndroidPhone() ||
    SGP.iSBlackberry() ||
    SGP.iSWindowsPhone()
  );
};

SGP.iSTablet = function () {
  return SGP.iSIpad() || SGP.iSAndroidTablet() || SGP.iSWindowsTablet();
};

SGP.iSIphone = function (range) {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  var match = SGP.iSIpad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/);
  return match !== null && SGP.compareVersion(match[1] || 1, range);
};

SGP.iSIpod = function (range) {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  var match = userAgent.match(/ipod.+?os (\d+)/);
  return match !== null && SGP.compareVersion(match[1], range);
};

SGP.iSIpad = function (range) {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  var match = userAgent.match(/ipad.+?os (\d+)/);
  return match !== null && SGP.compareVersion(match[1], range);
};

SGP.iSAndroidPhone = function () {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  return /android/.test(userAgent) && /mobile/.test(userAgent);
};

SGP.iSBlackberry = function () {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  return /blackberry/.test(userAgent) || /bb10/.test(userAgent);
};

SGP.iSWindowsPhone = function () {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  return SGP.iSWindows() && /phone/.test(userAgent);
};

SGP.iSWindows = function () {
  var appVersion = ((navigator && navigator.appVersion) || "").toLowerCase();
  return /win/.test(appVersion);
};

SGP.iSAndroidTablet = function () {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  return /android/.test(userAgent) && !/mobile/.test(userAgent);
};

SGP.iSWindowsTablet = function () {
  var userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
  return SGP.iSWindows() && !SGP.iSWindowsPhone() && /touch/.test(userAgent);
};

SGP.iSChrome = function () {
  return (
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  );
};

SGP.compareVersion = function (version, range) {
  var comparator = {
    "<": function (a, b) {
      return a < b;
    },
    "<=": function (a, b) {
      return a <= b;
    },
    ">": function (a, b) {
      return a > b;
    },
    ">=": function (a, b) {
      return a >= b;
    },
  };
  var string = range + "";
  var n = +(string.match(/\d+/) || NaN);
  var op = string.match(/^[<>]=?|/)[0];
  return comparator[op] ? comparator[op](version, n) : version == n || n !== n;
};

SGP.stopVideo = function (mainDiv) {
  var videoPopupContainer = mainDiv.querySelectorAll(
    ".sg-video-popup-container"
  );
  if (videoPopupContainer[0]) {
    for (var i = 0; i < videoPopupContainer.length; i++) {
      var videoPopupElement = videoPopupContainer[i];
      var videoIframeElem = videoPopupElement.querySelector("iframe");
      var videoIframeElemSrc = videoIframeElem.src;

      videoIframeElemSrc = videoIframeElemSrc.replace("?autoplay=1", "");
      videoIframeElemSrc = videoIframeElemSrc.replace("&mute=1", "");
      videoIframeElemSrc = videoIframeElemSrc.replace("&mute=0", "");
      videoIframeElemSrc = videoIframeElemSrc.replace("&muted=1", "");

      videoIframeElem.setAttribute("src", videoIframeElemSrc);
    }
  }
};

SGP.buttonColorOnHover = function (element, buttonHover) {
  if (buttonHover) {
    /** main properties */
    element.style.setProperty("color", buttonHover.labelColor, "important");
    element.style.setProperty(
      "border-color",
      buttonHover.borderColor,
      "important"
    );

    /** for new background properties */
    if (typeof buttonHover.background === "object") {
      var backgroundColor = buttonHover.background.color;
      var backgroundGradientStyle = buttonHover.background.gradient.style;
      var backgroundGradientOrientation =
        buttonHover.background.gradient.orientation;
      var backgroundGradientFirstColor =
        buttonHover.background.gradient.firstColor;
      var backgroundGradientSecondColor =
        buttonHover.background.gradient.secondColor;
      var backgroundImageUrl =
        buttonHover.background.image.url != "noImage"
          ? "url(" + buttonHover.background.image.url + ") "
          : "";
      var backgroundImageMode = buttonHover.background.image.mode + " ";

      var gradient = "";

      if (backgroundGradientStyle != "none") {
        gradient =
          " " +
          backgroundGradientStyle +
          "-gradient(" +
          backgroundGradientOrientation +
          ", " +
          backgroundGradientFirstColor +
          ", " +
          backgroundGradientSecondColor +
          ") ";
      }

      var backgroundImage = backgroundImageUrl + backgroundImageMode;
      backgroundImage = backgroundImage.trim().length
        ? backgroundImage + ", "
        : backgroundImage;

      var background = backgroundImage + backgroundColor + gradient;

      element.style.setProperty("background", background, "important");
    } else {
    /** for old popups */
      element.style.setProperty(
        "background-color",
        buttonHover.backgroundColor,
        "important"
      );
    }
  }
};

SGP.inputBorderColorOnFocus = function (element, inputOptions) {
  if (inputOptions) {
    element.style.setProperty(
      "outline",
      inputOptions.borderColorFocusing + " solid 2px",
      "important"
    );
    element.style.setProperty("outline-offset", "-1px", "important");
  } else {
    element.style.setProperty("outline", "none", "important");
  }
};

SGP.ageRestrictionClickOnNoButton = function (pid) {
  var restrictionUrl = document
    .getElementById("sg-age-restriction-no-btn-" + pid)
    .getAttribute("data-sg-restriction-url");
  window.location.href = restrictionUrl;
};

SGP.ageRestrictionClickOnYesButton = function (btnElement, pid) {
  var popupId = SGPM_POPUP_ID;
  var hashId = "";
  if (btnElement) {
    while (btnElement.parentNode) {
      if (btnElement.parentNode == document) {
        break;
      }

      if (
        btnElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")
      ) {
        popupMainWrapper = btnElement.parentNode;
        popupId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-id");
        hashId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-hash-id");
        break;
      }
      btnElement = btnElement.parentNode;
    }
  }

  SGPMPopup.getPopup(btnElement).close(true);

  var cookieExpires = document
    .getElementById("sg-age-restriction-yes-btn-" + pid)
    .getAttribute("data-sg-restriction-cookie-expires");
  var sameOriginCookie = document
    .getElementById("sg-age-restriction-yes-btn-" + pid)
    .getAttribute("data-sg-restriction-cookie-same-origin");
  sameOriginCookie =
    typeof sameOriginCookie !== "undefined" && sameOriginCookie == 1
      ? true
      : false;
  SGPMPopup.setCookie(
    "sgpm-age-restriction-" + hashId,
    "true",
    parseInt(cookieExpires),
    false,
    sameOriginCookie
  );
};

SGP.oldSubscribe = function (pid, btnElement) {
  var popupId = SGPM_POPUP_ID;
  var hashId = "";
  var hasError = false;
  var popupMainWrapper = "";
  if (btnElement) {
    while (btnElement.parentNode) {
      if (btnElement.parentNode == document) {
        break;
      }

      if (
        btnElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")
      ) {
        popupMainWrapper = btnElement.parentNode;
        popupId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-id");
        hashId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-hash-id");
        break;
      }
      btnElement = btnElement.parentNode;
    }
  }

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];

  var emailInput = popupMainWrapper.querySelector(
    "#sg-subscription-email-input-" + pid
  );
  var firstnameInput = popupMainWrapper.querySelector(
    "#sg-subscription-firstname-input-" + pid
  );
  var lastnameInput = popupMainWrapper.querySelector(
    "#sg-subscription-lastname-input-" + pid
  );

  var url = SGPM_APP_URL + "api/oldSubscribe";
  var email = emailInput.value.replace(/ /g, "");
  var firstname = firstnameInput.value;
  var lastname = lastnameInput.value;
  var sendMail = emailInput.getAttribute("data-send-mail");
  var params =
    "email=" +
    email +
    "&popupId=" +
    popupId +
    "&firstname=" +
    firstname +
    "&lastname=" +
    lastname +
    "&sendMail=" +
    sendMail +
    "";
  var popupWrapperHeight = SGPM_MAIN_DIV.style.height;
  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sg-subscription-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");
  var redirectNewTab = popupMainWrapper
    .querySelector(".sg-subscription-custom-option-data-" + pid)
    .getAttribute("data-redirect-new-tab");
  var windowOpenNewTab = "";
  var redirectUrl = popupMainWrapper
    .querySelector(".sg-subscription-custom-option-data-" + pid)
    .getAttribute("data-redirect-url");

  if (popupWrapperHeight == "") {
    popupWrapperHeight = SGPM_MAIN_DIV.clientHeight;
  }
  var responseFunction = function (response, id) {
    var response = JSON.parse(response.responseText);

    if (response["error"]) {
      if (windowOpenNewTab) {
        windowOpenNewTab.close();
      }
      emailInput.value = "";
      emailInput.setAttribute("placeholder", "");
      emailInput.setAttribute("placeholder", response["error"]);
      emailInput.classList.add("sg-placeholder-red");
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      hasError = true;
    } else if (response["successfully"]) {
      SGPM_MAIN_DIV.style.setProperty(
        "height",
        popupWrapperHeight + "px",
        "important"
      );
      SGP.oldAfterSubscribe(
        pid,
        popupId,
        popupMainWrapper,
        windowOpenNewTab,
        hashId
      );
    }
  };

  if (email == "") {
    emailInput.setAttribute("placeholder", "");
    emailInput.setAttribute("placeholder", "* Email field is required");
    emailInput.classList.add("sg-placeholder-red");
    emailInput.style.setProperty("border-color", "#e73d4a", "important");

    hasError = true;
  }

  if (email && !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    emailInput.value = "";
    emailInput.style.setProperty("border-color", "#e73d4a", "important");
    emailInput.setAttribute("placeholder", "*Please enter a valid email");
    emailInput.classList.add("sg-placeholder-red");
    hasError = true;
  }

  if (!hasError) {
    if (afterSubscribeBehavior == "redirectUrl" && redirectNewTab == "true") {
      windowOpenNewTab = window.open(redirectUrl);
    }
    SGP.sendPostRequest(url, responseFunction, params);
  }
};

SGP.oldAfterSubscribe = function (
  pid,
  popupId,
  popupMainWrapper,
  windowOpenNewTab,
  hashId
) {
  var emailInput = popupMainWrapper.querySelector(
    "#sg-subscription-email-input-" + pid
  );
  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sg-subscription-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");

  switch (afterSubscribeBehavior) {
    case "showSuccessMessage":
      var successMessage = popupMainWrapper
        .querySelector(".sg-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message");
      var successMessageColor = popupMainWrapper
        .querySelector(".sg-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message-color");
      var successMessageFontsize = popupMainWrapper
        .querySelector(".sg-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message-fontsize");
      SGPM_MAIN_DIV.innerHTML =
        "<span id='sg-subscribe-success-message'>" + successMessage + "</span>";
      SGPM_MAIN_DIV.style.textAlign = "center";
      document.getElementById("sg-subscribe-success-message").style.color =
        successMessageColor;
      document.getElementById("sg-subscribe-success-message").style.fontSize =
        successMessageFontsize;
      break;
    case "redirectUrl":
      var redirectUrl = popupMainWrapper
        .querySelector(".sg-subscription-custom-option-data-" + pid)
        .getAttribute("data-redirect-url");

      if (windowOpenNewTab) {
        SGPMPopup.getPopup(emailInput).close(true);
        windowOpenNewTab.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
      break;
    case "closePopup":
      SGPMPopup.getPopup(emailInput).close(true);
      break;
    case "spinPopup":
      if (SGPMSpinnerObjects[popupId] && SGPMSpinnerObjects[popupId].obj) {
        SGPMSpinnerObjects[popupId].obj.spin();
      }
      break;
  }

  if (decodeURI(window.location.href) != SGPM_APP_URL) {
    SGPMPopup.setCookie("sgpm-" + hashId, "true");
  }
};

SGP.subscribe = function (pid, btnElement) {
  var url = SGPM_APP_URL + "api/v1/subscription/service";
  var popupId = SGPM_POPUP_ID;
  var hashId = "";
  var params = "";
  var formData = {};
  var hasError = false;
  var listId = "";
  var elements = "";
  var emailInput = "";
  var popupMainWrapper = "";
  var numberLimit = 0;

  var customEvents;
  var eventNameBefore = "sgpm-before-subscribe-";
  var eventNameAfter = "sgpm-after-subscribe-";

  while (btnElement.parentNode) {
    if (btnElement.parentNode == document) {
      break;
    }

    if (btnElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")) {
      popupMainWrapper = btnElement.parentNode;
      popupId = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-popup-id");
      hashId = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-popup-hash-id");
      break;
    }
    btnElement = btnElement.parentNode;
  }

  customEvents = popupMainWrapper
    .querySelector("[data-sgpm-popup-id]")
    .getAttribute("data-sgpm-subcription-custom-events");
  if (customEvents) {
    var customEventsObj = JSON.parse(customEvents);
    eventNameBefore = customEventsObj.before;
    eventNameAfter = customEventsObj.after;
  }

  /* fire an event before user successfully subscribed */
  SGP.createCustomEvent(eventNameBefore + hashId, popupMainWrapper);

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];
  var emailInput = popupMainWrapper.querySelector(
    "#sgpm-subscription-email-input-" + pid
  );

  if (!emailInput) {
    SGP.oldSubscribe(pid, btnElement);
    return;
  }

  var beforeSubscribeFunctionName = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-before-subscribe-function-name");
  var submitForm = true;

  if (beforeSubscribeFunctionName) {
    if (typeof window[beforeSubscribeFunctionName] === "function") {
      try {
        submitForm = eval(beforeSubscribeFunctionName)();
      } catch (err) {
        submitForm = true;
      }
    }
  }

  if (!submitForm) {
    return;
  }

  var subscribeButton = btnElement.querySelector(".sgpm-subscribe-button");
  subscribeButton.setAttribute("disabled", true);

  var email = emailInput.value.replace(/ /g, "");
  var sendNotifyEmail = emailInput.getAttribute("data-send-mail");
  var emailErrorMessageRequired = emailInput.getAttribute(
    "data-sgpm-email-error-message-required"
  );
  if (!emailErrorMessageRequired || emailErrorMessageRequired == "undefined") {
    emailErrorMessageRequired = "* Email field is required";
  }
  var emailErrorMessageValid = emailInput.getAttribute(
    "data-sgpm-email-error-message-valid"
  );
  if (!emailErrorMessageValid || emailErrorMessageValid == "undefined") {
    emailErrorMessageValid = "* Please enter a valid email";
  }
  var subscriptionInfoSendTo = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-sgpm-subcription-reciever");

  var subscriptionInfoSendToEmail = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-receiver-email");
  var subscriptionInfoSendToName = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-receiver-name");

  var subscriptionRecaptcha = popupMainWrapper.querySelector(
    ".sgpm-subscription-recaptcha-" + pid
  );
  var subscriptionRecaptchaValue = subscriptionRecaptcha.value;
  if (subscriptionRecaptchaValue != "") {
    console.log("Error: Recaptcha has a value!");
    return;
  }

  var subcriptionForm = popupMainWrapper.querySelector(
    '[data-sgpopuptype="FESubscriptionPopup"][data-pid="' + pid + '"]'
  );
  elements = subcriptionForm.querySelectorAll("input, select, textarea");
  var requiredCheckboxName = [];

  var checkboxErrorDivs = subcriptionForm.querySelectorAll(
    ".sgpm-checkbox-required-error"
  );
  for (var i = 0; i < checkboxErrorDivs.length; ++i) {
    checkboxErrorDivs[i].remove();
  }

  for (var i = 0; i < elements.length; ++i) {
    var element = elements[i];
    var name = element.name;
    var value = element.value;
    var errorInputName = "This";
    var attrName = name.replace("[", "");
    attrName = attrName.replace("]", "");
    element.style.setProperty("border-color", "#ADADAD", "important");
    element.isRequired = false;
    element.isLimited = false;
    numberLimit = element.getAttribute("data-sgpm-limit");
    numberMinLimit = element.getAttribute("data-sgpm-min-limit");
    numberMaxLimit = element.getAttribute("data-sgpm-max-limit");
    numberLimit = numberLimit ? numberLimit : numberMaxLimit;

    if (email == "") {
      emailInput.setAttribute("placeholder", "");
      emailInput.setAttribute("placeholder", emailErrorMessageRequired);
      emailInput.classList.add("sgpm-placeholder-red");
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      hasError = true;
    }

    if (email && !email.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim)) {
      emailInput.value = "";
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      emailInput.setAttribute("placeholder", emailErrorMessageValid);
      emailInput.classList.add("sgpm-placeholder-red");
      hasError = true;
    }

    if (
      (" " + element.className + " ").indexOf(" required ") > -1 &&
      value == ""
    ) {
      element.isRequired = true;
      if (element.placeholder) {
        errorInputName = element.getAttribute(
          "data-subscription-" + attrName + "-label"
        );
      } else {
        element.setAttribute(
          "data-subscription-" + attrName + "-label",
          "This"
        );
      }

      var errorMessageRequired = element.getAttribute(
        "data-sgpm-error-message-required"
      );

      if (!errorMessageRequired || errorMessageRequired == "undefined") {
        errorMessageRequired = "*" + errorInputName + " field is required";
      }
      element.style.setProperty("border-color", "#e73d4a", "important");
      element.setAttribute("placeholder", "");
      element.setAttribute("placeholder", errorMessageRequired);
      element.classList.add("sgpm-placeholder-red");
      hasError = true;
    }

    if (
      ((" " + element.className + " ").indexOf(" limited ") > -1 ||
        (" " + element.className + " ").indexOf(" max-limited ") > -1) &&
      value.length > numberLimit
    ) {
      element.isLimited = true;
      if (element.placeholder) {
        errorInputName = element.getAttribute(
          "data-subscription-" + attrName + "-label"
        );
      } else {
        element.setAttribute(
          "data-subscription-" + attrName + "-label",
          "This"
        );
      }

      var errorMessageLimited = element.getAttribute(
        "data-sgpm-error-message-limited"
      );
      var errorMessageMaxLimited = element.getAttribute(
        "data-sgpm-error-message-max-limited"
      );
      errorMessageLimited = errorMessageLimited
        ? errorMessageLimited
        : errorMessageMaxLimited;

      element.style.setProperty("border-color", "#e73d4a", "important");
      element.setAttribute("placeholder", "");
      element.setAttribute("placeholder", errorMessageLimited);
      element.classList.add("sgpm-placeholder-red");

      var errorMessage = document.createElement("DIV");
      if (!errorMessageLimited || errorMessageLimited == "undefined") {
        errorMessageLimited =
          "* The maximum number of " + numberLimit + " digits exceeded.";
      }
      errorMessage.innerHTML = "<span>" + errorMessageLimited + "</span>";
      errorMessage.classList.add("sgpm-checkbox-required-error");
      errorMessage.classList.add("sgpm-red");
      errorMessage.classList.add("sgpm-text-left");
      errorMessage.style.marginTop = "-" + element.style.marginBottom;
      errorMessage.style.marginBottom = element.style.marginBottom;

      var container = subcriptionForm
        .querySelector('[name="' + name + '"]')
        .closest(".sgpm-subscription-form-dynamic-input-container");

      container.appendChild(errorMessage);
      hasError = true;
    }

    if (
      (" " + element.className + " ").indexOf(" min-limited ") > -1 &&
      value.length < numberMinLimit
    ) {
      element.isLimited = true;
      if (element.placeholder) {
        errorInputName = element.getAttribute(
          "data-subscription-" + attrName + "-label"
        );
      } else {
        element.setAttribute(
          "data-subscription-" + attrName + "-label",
          "This"
        );
      }

      var errorMessageLimited = element.getAttribute(
        "data-sgpm-error-message-min-limited"
      );

      element.style.setProperty("border-color", "#e73d4a", "important");
      element.setAttribute("placeholder", "");
      element.setAttribute("placeholder", errorMessageLimited);
      element.classList.add("sgpm-placeholder-red");

      var errorMessageContainer = document.createElement("DIV");
      var errorMessage = document.createElement("DIV");
      if (!errorMessageLimited || errorMessageLimited == "undefined") {
        errorMessageLimited =
          "* The minimum number of digits allowed is " + numberMinLimit + ".";
      }
      errorMessage.innerHTML = "<span>" + errorMessageLimited + "</span>";
      errorMessage.classList.add("sgpm-checkbox-required-error");
      errorMessage.classList.add("sgpm-red");
      errorMessage.classList.add("sgpm-text-left");
      errorMessage.style.width = element.style.width;
      errorMessage.style.display = "inline-block";
      errorMessageContainer.style.marginTop = "-" + element.style.marginBottom;
      errorMessageContainer.style.marginBottom = element.style.marginBottom;

      /* if dial codes are enabled, than use parend containers' margin values */
      if (element.getAttribute("data-use-dial-codes") == "true") {
        var parrentNode = element.parentNode;
        errorMessage.style.width = parrentNode.style.width;
        errorMessageContainer.style.marginTop =
          "-" + parrentNode.style.marginBottom;
        errorMessageContainer.style.marginBottom =
          parrentNode.style.marginBottom;
      }
      errorMessageContainer.appendChild(errorMessage);

      var container = subcriptionForm
        .querySelector('[name="' + name + '"]')
        .closest(".sgpm-subscription-form-dynamic-input-container");

      container.appendChild(errorMessageContainer);
      hasError = true;
    }

    /*
     * For storing phone numbers with dial codes such as + 374 9951...
     */
    if (
      element.type == "text" &&
      element.getAttribute("data-use-dial-codes") === "true"
    ) {
      var container = subcriptionForm.querySelector(
        ".sgpm-subscription-phone-field-container"
      );
      var dialCodeElement = container.querySelector(
        ".sgpm-subscription-form-phone-dial-codes"
      );
      var dialCode = dialCodeElement.value;

      if (dialCode.indexOf("+") === -1) {
        var selectedValue =
          dialCodeElement.options[dialCodeElement.selectedIndex];
        dialCode = selectedValue.getAttribute("data-dial-code");
      }

      value = encodeURIComponent(
        dialCode + " " + value
      ); /* encode string to avoid losing characters */
    }

    if (
      element.type == "checkbox" &&
      (" " + element.className + " ").indexOf(" required ") > -1
    ) {
      var checkboxErrorMessage = element.getAttribute(
        "data-sgpm-error-message-required"
      );
      if (requiredCheckboxName.indexOf(name) < 0) {
        requiredCheckboxName.push(name);
      }
    }

    if (element.type == "checkbox" || element.type == "radio") {
      if (!formData[name]) {
        formData[name] = {
          value: [],
          required: element.isRequired,
          label: element.getAttribute(
            "data-subscription-" + attrName + "-label"
          ),
          type: element.type,
          tagName: element.getAttribute(
            "data-subscription-" + attrName + "-tag-name"
          ),
        };
      }
      if (element.checked) {
        formData[name].value.push(value);
      }
    } else if (name) {
      formData[name] = {
        value: value,
        required: element.isRequired,
        label: element.getAttribute("data-subscription-" + attrName + "-label"),
        type: element.type,
        tagName: element.getAttribute(
          "data-subscription-" + attrName + "-tag-name"
        ),
      };
    }
  }

  for (var i = 0; i < requiredCheckboxName.length; ++i) {
    var checkboxMergeName = requiredCheckboxName[i];
    var checkboxData = formData[checkboxMergeName];
    if (checkboxData.value.length == 0) {
      hasError = true;
      var chackboxList = subcriptionForm
        .querySelectorAll('[name="' + checkboxMergeName + '"]')[0]
        .closest(".sgpm-checkbox-list");
      var errorMessage = document.createElement("DIV");
      if (!checkboxErrorMessage || checkboxErrorMessage == "undefined") {
        checkboxErrorMessage = "* Please select at least one option";
      }
      errorMessage.innerHTML = "<span>" + checkboxErrorMessage + "</span>";
      errorMessage.classList.add("sgpm-checkbox-required-error");
      errorMessage.classList.add("sgpm-red");
      errorMessage.classList.add("sgpm-text-left");
      chackboxList.appendChild(errorMessage);
    }
  }

  if (hasError) {
    subscribeButton.removeAttribute("disabled");
  }

  var utmDataObj = SGP.parseUtmSources(window.location.href);
  if (SGPM_POPUP_STATISTICS[popupId]) {
    var statisticsId = SGPM_POPUP_STATISTICS[popupId].statisticsLogId;
  }

  var mergeFields = JSON.stringify(formData);
  params += "popupId=" + popupId + "&";
  params += "email=" + email + "&";
  params += "mergeFields=" + mergeFields + "&";
  params += "&sendNotifyEmail=" + sendNotifyEmail + "&";
  params += "&subscriptionRecaptchaValue=" + subscriptionRecaptchaValue + "&";

  if (subscriptionInfoSendTo !== null) {
    params += "subscriptionInfoSendTo=" + subscriptionInfoSendTo + "&";
  } else {
    params +=
      "subscriptionInfoSendToEmail=" + subscriptionInfoSendToEmail + "&";
    params += "subscriptionInfoSendToName=" + subscriptionInfoSendToName + "&";
  }

  var subscriptionMergeFieldsName = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-subscription-merge-fields-name");
  params += "subscriptionMergeFieldsName=" + subscriptionMergeFieldsName + "&";
  params += "statisticsId=" + statisticsId;

  if (utmDataObj) {
    params += "&subscriptionUtmData=" + JSON.stringify(utmDataObj);
  }

  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");
  var redirectNewTab = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-redirect-new-tab");
  var windowOpenNewTab = "";
  var redirectUrl = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-redirect-url");

  var popupWrapperHeight = SGPM_MAIN_DIV.style.height;
  if (popupWrapperHeight == "") {
    popupWrapperHeight = SGPM_MAIN_DIV.clientHeight;
  }

  var responseFunction = function (response, id) {
    var response = JSON.parse(response.responseText);
    var subscriberId = response["subscriber_id"];
    if (response["successfully"]) {
      SGPM_MAIN_DIV.style.setProperty(
        "height",
        popupWrapperHeight + "px",
        "important"
      );
      SGP.afterSubscribe(
        pid,
        popupId,
        popupMainWrapper,
        windowOpenNewTab,
        subscriberId,
        hashId
      );

      /* fire an event after user successfully subscribed */
      SGP.createCustomEvent(eventNameAfter + hashId, popupMainWrapper);
    } else if (
      response["hasError"] &&
      (response["message"] == "* Email address already used." ||
        response["message"] == "* Please provide a valid email address.")
    ) {
      if (windowOpenNewTab) {
        windowOpenNewTab.close();
      }
      emailInput.value = "";
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      emailInput.setAttribute("placeholder", response["message"]);
      emailInput.classList.add("sgpm-placeholder-red");
      hasError = true;
    }
    subscribeButton.removeAttribute("disabled");
  };

  if (!hasError) {
    if (afterSubscribeBehavior == "redirectUrl" && redirectNewTab == "true") {
      windowOpenNewTab = window.open(redirectUrl);
    }

    var afterSubscribeBehavior = popupMainWrapper
      .querySelector(".sgpm-subscription-custom-option-data-" + pid)
      .getAttribute("data-after-subscribe-behavior");

    if (afterSubscribeBehavior == "spinPopup") {
      params += "&notifyZapier=false";
    }

    SGP.sendPostRequest(url, responseFunction, params);
  }
};

SGP.parseUtmSources = function (url) {
  var url = url.split("?");
  if (url.length == 1) return;

  var urlParams = url[1].split("&");
  var utmObj = {};

  for (var key in urlParams) {
    if (urlParams.hasOwnProperty(key)) {
      var element = urlParams[key];
      if (element.substring(0, 3) == "utm") {
        var param = element.split("=");
        utmObj[param[0]] = param[1];
      }
    }
  }

  if (SGP.isObjEmpty(utmObj)) return;
  return utmObj;
};

SGP.afterSubscribe = function (
  pid,
  popupId,
  popupMainWrapper,
  windowOpenNewTab,
  subscriberId,
  hashId
) {
  var emailInput = popupMainWrapper.querySelector(
    "#sgpm-subscription-email-input-" + pid
  );
  var cookieData = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-sgpm-subcription-cookie-expires");
  var sameOriginCookie = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-sgpm-subcription-cookie-same-origin");
  sameOriginCookie =
    typeof sameOriginCookie !== "undefined" && sameOriginCookie == 1
      ? true
      : false;
  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");

  var openPopupId = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-sg-open-popup-id");
  var openOtherPopupCloseCurrent = popupMainWrapper
    .querySelector(".sgpm-subscription-custom-option-data-" + pid)
    .getAttribute("data-sg-open-popup-close-current");

  switch (afterSubscribeBehavior) {
    case "showSuccessMessage":
      var successMessage = decodeURIComponent(
        popupMainWrapper
          .querySelector(".sgpm-subscription-custom-option-data-" + pid)
          .getAttribute("data-success-message")
      );
      var successMessageColor = popupMainWrapper
        .querySelector(".sgpm-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message-color");
      var successMessageFontsize = popupMainWrapper
        .querySelector(".sgpm-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message-fontsize");
      var successMessageTextAlign = popupMainWrapper
        .querySelector(".sgpm-subscription-custom-option-data-" + pid)
        .getAttribute("data-success-message-text-align");
      if (!successMessageTextAlign) {
        successMessageTextAlign = "center";
      }

      SGPM_MAIN_DIV.innerHTML =
        "<p id='sgpm-subscribe-success-message'>" + successMessage + "</p>";
      SGPM_MAIN_DIV.style.textAlign = "center";
      var successMessage = popupMainWrapper.querySelector(
        "#sgpm-subscribe-success-message"
      );

      successMessage.style.setProperty(
        "color",
        successMessageColor,
        "important"
      );
      successMessage.style.setProperty(
        "font-size",
        successMessageFontsize,
        "important"
      );

      var successMessageHeight = successMessage.offsetHeight;
      var paddingTop =
        (parseFloat(popupMainWrapper.style.height) - successMessageHeight) / 2;

      successMessage.style.setProperty(
        "padding-top",
        paddingTop + "px",
        "important"
      );
      popupMainWrapper.style.textAlign = successMessageTextAlign;

      break;
    case "redirectUrl":
      var redirectUrl = popupMainWrapper
        .querySelector(".sgpm-subscription-custom-option-data-" + pid)
        .getAttribute("data-redirect-url");

      if (windowOpenNewTab) {
        SGPMPopup.getPopup(emailInput).close(true);
        windowOpenNewTab.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
      break;
    case "closePopup":
      SGPMPopup.getPopup(emailInput).close(true);
      break;
    case "spinPopup":
      if (SGPMSpinnerObjects[popupId] && SGPMSpinnerObjects[popupId].obj) {
        SGPMSpinnerObjects[popupId]["subscriber_id"] = subscriberId;
        SGPMSpinnerObjects[popupId].obj.spin();
      }
      break;
    case "openPopup":
      if (openOtherPopupCloseCurrent == "true") {
        SGPMPopup.getPopup(emailInput).close(true);
      }

      if (SGPMPopupLoader.popups[openPopupId]) {
        SGPMPopupLoader.popups[openPopupId].open(true);
      }
      break;
  }

  if (decodeURI(window.location.href) != SGPM_APP_URL) {
    /** set flag to subscribe */
    var localStorageVal = {
      subscribed: true,
    };
    SGPMPopup.setLocalStorage("sgpm-storage-" + hashId, localStorageVal);

    if (cookieData !== null) {
      var cookieDataAsJson = JSON.parse(cookieData);
      if (cookieDataAsJson.showOnlyOnce) {
        SGPMPopup.setCookie(
          "sgpm-subscription-" + hashId,
          "true",
          parseInt(cookieDataAsJson.cookieExpires),
          false,
          sameOriginCookie
        );
      }
    } else {
      SGPMPopup.setCookie("sgpm-subscription-" + hashId, "true");
    }

    // if popup successfully submited send analytics
    var trackingAction = "Subscription form successfully submited.";
    var subscriptionPopupName =
      "Subscription form inside - " + SGPM_POPUP_OBJ[popupId]["name"];
    var integrations = SGPM_POPUP_OBJ[popupId]["integrations"];

    if (integrations.GoogleAnalytics) {
      SGGoogleAnalytics.eventTracking(trackingAction, subscriptionPopupName);
    }
  }
};

SGP.subscribeToMailChimp = function (pid, btnElement) {
  var url = SGPM_APP_URL + "api/v1/subscription/mailchimp";

  var popupId = SGPM_POPUP_ID;
  var hashId = "";
  var params = "";
  var formData = {};
  var hasError = false;
  var listId = "";
  var elements = "";
  var emailInput = "";
  var popupMainWrapper = "";

  var customEvents;
  var eventNameBefore = "sgpm-mc-before-subscribe-";
  var eventNameAfter = "sgpm-mc-after-subscribe-";

  while (btnElement.parentNode) {
    if (btnElement.parentNode == document) {
      break;
    }

    if (btnElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")) {
      popupMainWrapper = btnElement.parentNode;
      popupId = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-popup-id");
      hashId = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-popup-hash-id");
      break;
    }
    btnElement = btnElement.parentNode;
  }

  customEvents = popupMainWrapper
    .querySelector("[data-sgpm-popup-id]")
    .getAttribute("data-sgpm-subcription-custom-events");
  if (customEvents) {
    var customEventsObj = JSON.parse(customEvents);
    eventNameBefore = customEventsObj.before;
    eventNameAfter = customEventsObj.after;
  }

  /* fire an event before user successfully subscribed */
  SGP.createCustomEvent(eventNameBefore + hashId, popupMainWrapper);

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];
  elements = popupMainWrapper.querySelectorAll("input, select, textarea");
  emailInput = popupMainWrapper.querySelector(
    "#sg-mailchimp-email-input-" + pid
  );
  listId = popupMainWrapper
    .querySelector("[data-mailchimp-list-id]")
    .getAttribute("data-mailchimp-list-id");

  var doubleOptinIsChecked = popupMainWrapper
    .querySelector(".sg-mailchimp-custom-option-data-" + pid)
    .getAttribute("data-double-optin-is-checked");

  for (var i = 0; i < elements.length; ++i) {
    var element = elements[i];
    var name = element.name;
    var value = element.value;
    var errorInputName = "This";
    var attrName = name.replace("[", "-");
    attrName = attrName.replace("]", "");
    element.style.setProperty("border-color", "#ADADAD", "important");

    if (
      (" " + element.className + " ").indexOf(" sg-mailchimp-form-phone-us ") <
        0 &&
      (" " + element.className + " ").indexOf(" required ") > -1 &&
      value == ""
    ) {
      if (element.placeholder) {
        errorInputName = element.getAttribute(
          "data-mailchimp-" + attrName + "-label"
        );
      } else {
        element.setAttribute("data-mailchimp-" + attrName + "-label", "This");
      }
      element.style.setProperty("border-color", "#e73d4a", "important");
      element.setAttribute("placeholder", "");
      element.setAttribute(
        "placeholder",
        "*" + errorInputName + " field is required"
      );
      element.classList.add("sg-placeholder-red");
      hasError = true;
    }

    if (
      (" " + element.className + " ").indexOf(" sg-mailchimp-form-phone-us ") >
        -1 &&
      (" " + element.className + " ").indexOf(" required ") > -1 &&
      value == ""
    ) {
      if (element.placeholder) {
        errorInputName = element.getAttribute(
          "data-mailchimp-" + attrName + "-label"
        );
      } else {
        element.setAttribute("data-mailchimp-" + attrName + "-label", "This");
      }
      element.style.setProperty("border-color", "#e73d4a", "important");
      element.setAttribute("placeholder", "");
      element.setAttribute("placeholder", "*");
      element.classList.add("sg-placeholder-red");
      hasError = true;
    }

    if (element.type == "radio" || element.type == "checkbox") {
      if (element.checked && name) {
        formData[name] = value;
        params += "" + name + "=" + value + "&";
      }
    } else {
      if (name) {
        formData[name] = value;
        params += "" + name + "=" + value + "&";
      }
    }
  }

  params += "listId=" + listId + "&";
  params += "popupId=" + popupId + "&";
  params += "doubleOptinIsChecked=" + doubleOptinIsChecked + "&";
  var email = formData["EMAIL"];
  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sg-mailchimp-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");
  var redirectNewTab = popupMainWrapper
    .querySelector(".sg-mailchimp-custom-option-data-" + pid)
    .getAttribute("data-redirect-new-tab");
  var windowOpenNewTab = "";
  var redirectUrl = popupMainWrapper
    .querySelector(".sg-mailchimp-custom-option-data-" + pid)
    .getAttribute("data-redirect-url");

  var popupWrapperHeight = SGPM_MAIN_DIV.style.height;
  if (popupWrapperHeight == "") {
    popupWrapperHeight = SGPM_MAIN_DIV.clientHeight;
  }

  var responseFunction = function (response, id) {
    var response = JSON.parse(response.responseText);
    if (response["status"] == 200) {
      SGPM_MAIN_DIV.style.setProperty(
        "height",
        popupWrapperHeight + "px",
        "important"
      );
      SGP.afterSubscribeMailChimp(
        pid,
        popupId,
        popupMainWrapper,
        windowOpenNewTab,
        hashId
      );

      /* fire an event after user successfully subscribed */
      SGP.createCustomEvent(eventNameAfter + hashId, popupMainWrapper);
    } else if (
      (response["status"] == 400 || response["code"] > 400) &&
      response["message"] == "Member Exists"
    ) {
      if (windowOpenNewTab) {
        windowOpenNewTab.close();
      }
      emailInput.value = "";
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      emailInput.setAttribute(
        "placeholder",
        "*Too many subscribe attempts for this email address"
      );
      emailInput.classList.add("sg-placeholder-red");
      hasError = true;
    } else if (response["status"] > 400 || response["code"] > 400) {
      emailInput.value = "";
      emailInput.style.setProperty("border-color", "#e73d4a", "important");
      emailInput.setAttribute(
        "placeholder",
        "*Sorry, there was a problem with the subscription process"
      );
      emailInput.classList.add("sg-placeholder-red");
      hasError = true;
    }
  };

  email = email.replace(/ /g, "");
  if (email && !email.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim)) {
    emailInput.value = "";
    emailInput.style.setProperty("border-color", "#e73d4a", "important");
    emailInput.setAttribute("placeholder", "*Please enter a valid email");
    emailInput.classList.add("sg-placeholder-red");
    hasError = true;
  }

  var gdprWrapper = popupMainWrapper.querySelector(
    "#sg-mailchimp-gdpr-content-" + pid
  );

  if (gdprWrapper !== null) {
    var isMailchimpGDPRChecboxHidden =
      popupMainWrapper.querySelector("#sg-mailchimp-gdpr-content-" + pid).style
        .display === "none";

    if (!isMailchimpGDPRChecboxHidden) {
      var gdprCheckboxChecked = popupMainWrapper.querySelector(
        "#sg-mailchimp-gdpr-input-" + pid
      ).checked;
      var gdprRequired = popupMainWrapper
        .querySelector(".sg-mailchimp-custom-option-data-" + pid)
        .getAttribute("data-sgpm-mainlchimp-gdpr-required");
      var gdprContaier = popupMainWrapper.querySelector(
        "#sg-mailchimp-gdpr-content-" + pid
      );

      if (gdprRequired == "true" && !gdprCheckboxChecked) {
        var existingMsg = popupMainWrapper.querySelector(
          ".sgpm-gdpr-error-msg"
        );
        if (existingMsg) existingMsg.remove();

        var gdprRequiredError = popupMainWrapper
          .querySelector(".sg-mailchimp-custom-option-data-" + pid)
          .getAttribute("data-sgpm-mainlchimp-gdpr-required-error");

        var error = document.createElement("p");
        error.innerHTML = gdprRequiredError;
        error.style.color = "#e73d4a";
        error.style.textAlign = "left";
        error.className = "sgpm-gdpr-error-msg";

        gdprContaier.parentNode.insertBefore(error, gdprContaier);
        hasError = true;
      }
    }
  }

  if (!hasError) {
    if (afterSubscribeBehavior == "redirectUrl" && redirectNewTab == "true") {
      windowOpenNewTab = window.open(redirectUrl);
    }
    SGP.sendPostRequest(url, responseFunction, params);
  }
};

SGP.afterSubscribeMailChimp = function (
  pid,
  popupId,
  popupMainWrapper,
  windowOpenNewTab,
  hashId
) {
  var emailInput = popupMainWrapper.querySelector(
    "#sg-mailchimp-email-input-" + pid
  );
  var afterSubscribeBehavior = popupMainWrapper
    .querySelector(".sg-mailchimp-custom-option-data-" + pid)
    .getAttribute("data-after-subscribe-behavior");

  switch (afterSubscribeBehavior) {
    case "showSuccessMessage":
      var successMessage = decodeURIComponent(
        popupMainWrapper
          .querySelector(".sg-mailchimp-custom-option-data-" + pid)
          .getAttribute("data-success-message")
      );
      var successMessageColor = popupMainWrapper
        .querySelector(".sg-mailchimp-custom-option-data-" + pid)
        .getAttribute("data-success-message-color");
      var successMessageFontsize = popupMainWrapper
        .querySelector(".sg-mailchimp-custom-option-data-" + pid)
        .getAttribute("data-success-message-fontsize");
      SGPM_MAIN_DIV.innerHTML =
        "<span id='sg-mailchimp-subscribe-success-message'>" +
        successMessage +
        "</span>";
      SGPM_MAIN_DIV.style.textAlign = "center";
      document.getElementById(
        "sg-mailchimp-subscribe-success-message"
      ).style.color = successMessageColor;
      document.getElementById(
        "sg-mailchimp-subscribe-success-message"
      ).style.fontSize = successMessageFontsize;
      break;
    case "redirectUrl":
      var redirectUrl = popupMainWrapper
        .querySelector(".sg-mailchimp-custom-option-data-" + pid)
        .getAttribute("data-redirect-url");

      if (windowOpenNewTab) {
        SGPMPopup.getPopup(emailInput).close(true);
        windowOpenNewTab.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
      break;
    case "closePopup":
      SGPMPopup.getPopup(emailInput).close(true);
      break;
    case "spinPopup":
      if (SGPMSpinnerObjects[popupId] && SGPMSpinnerObjects[popupId].obj) {
        SGPMSpinnerObjects[popupId].obj.spin();
      }
      break;
  }

  if (decodeURI(window.location.href) != SGPM_APP_URL) {
    SGPMPopup.setCookie("sgpm-mailchimp-" + hashId, "true");
  }
};

SGP.contact = function (pid, btnElement) {
  var popupId = SGPM_POPUP_ID;
  var popupMainWrapper = "";
  var hashId;
  var customEvents;
  var eventNameBefore = "sgpm-before-contact-";
  var eventNameAfter = "sgpm-after-contact-";

  if (btnElement) {
    var currentElement = btnElement;
    while (currentElement.parentNode) {
      if (currentElement.parentNode == document) {
        break;
      }

      if (
        currentElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")
      ) {
        popupMainWrapper = currentElement.parentNode;
        popupId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-id");
        hashId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-hash-id");
        break;
      }
      currentElement = currentElement.parentNode;
    }
  }

  customEvents = popupMainWrapper
    .querySelector("[data-sgpm-popup-id]")
    .getAttribute("data-sgpm-contact-form-custom-events");
  if (customEvents) {
    var customEventsObj = JSON.parse(customEvents);
    eventNameBefore = customEventsObj.before;
    eventNameAfter = customEventsObj.after;
  }

  /* fire an event before user successfully contacted */
  SGP.createCustomEvent(eventNameBefore + hashId, popupMainWrapper);

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];

  var emailInput = popupMainWrapper.querySelector(
    "#sg-contactform-email-input-" + pid
  );
  var emailContainer = popupMainWrapper.querySelector(
    ".sg-contactform-email-content"
  );
  var phoneInput = popupMainWrapper.querySelector(
    "#sg-contactform-phone-input-" + pid
  );
  var phoneContainer = popupMainWrapper.querySelector(
    ".sg-contactform-phone-content"
  );
  var nameInput = popupMainWrapper.querySelector(
    "#sg-contactform-name-input-" + pid
  );
  var nameContainer = popupMainWrapper.querySelector(
    ".sg-contactform-name-content"
  );
  var subjectInput = popupMainWrapper.querySelector(
    "#sg-contactform-subject-input-" + pid
  );
  var subjectContainer = popupMainWrapper.querySelector(
    ".sg-contactform-subject-content"
  );
  var messageInput = popupMainWrapper.querySelector(
    "#sg-contactform-message-input-" + pid
  );
  var messageContainer = popupMainWrapper.querySelector(
    ".sg-contactform-message-content"
  );
  var gdprInput = popupMainWrapper.querySelector(
    "#sg-contactform-gdpr-input-" + pid
  );
  var gdprContainer = popupMainWrapper.querySelector(
    "#sg-contactform-gdpr-content-" + pid
  );
  if (!gdprContainer) {
    gdprContainer = popupMainWrapper.querySelector(
      ".sg-contactform-gdpr-content"
    );
  }
  var contactformInfoSendToEmail = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-receiver-email");
  var contactformInfoSendToName = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-receiver-name");
  var afterContactBehavior = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-after-contact-behavior");
  var redirectNewTab = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-redirect-new-tab");
  var windowOpenNewTab = "";
  var redirectUrl = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-redirect-url");
  var url = SGPM_APP_URL + "api/v1/contactform/contact";
  /* inputs values */
  var email = emailInput.value.replace(/ /g, "");
  /* The phone field was added later, that's why we have to perform checks for back compatibality */
  var phone = phoneInput ? phoneInput.value : null;
  /* The gdpr field was added later, that's why we have to perform checks for back compatibality */
  var gdpr = gdprInput ? gdprInput.checked : null;
  var name = nameInput.value;
  var subject = subjectInput.value;
  var message = messageInput.value;

  /* Required fields must be compatible with older versions where there were no required field options */
  var emailRequired = emailContainer.getAttribute("data-sgpm-required");
  if (emailRequired !== null) {
    emailRequired = !!+emailRequired;
  } else {
    emailRequired = true;
  }

  var nameRequired = nameContainer.getAttribute("data-sgpm-required");
  if (nameRequired !== null) {
    nameRequired = !!+nameRequired;
  } else {
    nameRequired = true;
  }

  /* The phone field was added later, that's why we have to perform checks for back compatibality */
  var phoneRequired = phoneContainer
    ? phoneContainer.getAttribute("data-sgpm-required")
    : null;
  if (phoneRequired !== null) {
    phoneRequired = !!+phoneRequired;
  } else {
    phoneRequired = false;
  }

  var subjectRequired = subjectContainer.getAttribute("data-sgpm-required");
  if (subjectRequired !== null) {
    subjectRequired = !!+subjectRequired;
  } else {
    subjectRequired = true;
  }

  var messageRequired = messageContainer.getAttribute("data-sgpm-required");
  if (messageRequired !== null) {
    messageRequired = !!+messageRequired;
  } else {
    messageRequired = true;
  }

  /* The gdpr field was added later, that's why we have to perform checks for back compatibality */
  var gdprRequired = gdprContainer
    ? gdprContainer.getAttribute("data-sgpm-required")
    : null;
  if (gdprRequired !== null) {
    gdprRequired = !!+gdprRequired;
  } else {
    gdprRequired = false;
  }

  var params =
    "email=" +
    email +
    "&phone=" +
    phone +
    "&gdpr=" +
    gdpr +
    "&popupId=" +
    popupId +
    "&name=" +
    name +
    "&subject=" +
    subject +
    "&message=" +
    message +
    "&contactformInfoSendToEmail=" +
    contactformInfoSendToEmail +
    "&contactformInfoSendToName=" +
    contactformInfoSendToName +
    "&emailRequired=" +
    +emailRequired +
    "&nameRequired=" +
    +nameRequired +
    "&phoneRequired=" +
    +phoneRequired +
    "&subjectRequired=" +
    +subjectRequired +
    "&gdprRequired=" +
    +gdprRequired +
    "";
  var popupWrapperHeight = SGPM_MAIN_DIV.style.height;
  if (popupWrapperHeight == "") {
    popupWrapperHeight = SGPM_MAIN_DIV.clientHeight;
  }

  // inputs elements
  emailInput.style.setProperty("border-color", "#ADADAD", "important");
  nameInput.style.setProperty("border-color", "#ADADAD", "important");
  subjectInput.style.setProperty("border-color", "#ADADAD", "important");
  messageInput.style.setProperty("border-color", "#ADADAD", "important");

  if (gdprContainer) {
    var gdprErrorContent = gdprContainer.querySelector(
      ".sgpm-gdpr-checkbox-required-error"
    );
    if (gdprErrorContent) {
      gdprErrorContent.remove();
    }
  }

  var responseFunction = function (response, id) {
    /*We trigger onmouseout to make button come to its initial look*/
    btnElement.onmouseout();
    btnElement.removeAttribute("disabled", "");
    /*Make button text to default*/
    btnElement.innerHTML = btnText;
    var response = JSON.parse(response.responseText);
    if (response["successfully"]) {
      SGPM_MAIN_DIV.style.setProperty(
        "height",
        popupWrapperHeight + "px",
        "important"
      );
      SGP.afterContact(pid, popupId, popupMainWrapper, windowOpenNewTab);

      /* fire an event after user successfully contacted */
      SGP.createCustomEvent(eventNameAfter + hashId, popupMainWrapper);
    } else {
      if (windowOpenNewTab) {
        windowOpenNewTab.close();
      }
    }
  };
  var hasError = false;

  if (emailRequired && email == "") {
    var emailRequiredErrorMessage = emailInput.getAttribute(
      "data-sgpm-contactform-email-error-message-required"
    );
    if (
      !emailRequiredErrorMessage ||
      emailRequiredErrorMessage == "undefined"
    ) {
      emailRequiredErrorMessage = "* Email field is required";
    }
    emailInput.value = "";
    emailInput.setAttribute("placeholder", "");
    emailInput.setAttribute("placeholder", emailRequiredErrorMessage);
    emailInput.classList.add("sg-placeholder-red");
    emailInput.style.setProperty("border-color", "#e73d4a", "important");
    hasError = true;
  }

  if (email && !email.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim)) {
    var emailValidErrorMessage = emailInput.getAttribute(
      "data-sgpm-contactform-email-error-message-valid"
    );
    if (!emailValidErrorMessage || emailValidErrorMessage == "undefined") {
      emailValidErrorMessage = "* Please enter a valid email";
    }
    emailInput.value = "";
    emailInput.style.setProperty("border-color", "#e73d4a", "important");
    emailInput.setAttribute("placeholder", emailValidErrorMessage);
    emailInput.classList.add("sg-placeholder-red");
    hasError = true;
  }

  if (phoneRequired && !phone) {
    var phoneRequiredErrorMessage = phoneInput.getAttribute(
      "data-sgpm-contactform-phone-error-message-required"
    );
    if (
      !phoneRequiredErrorMessage ||
      phoneRequiredErrorMessage == "undefined"
    ) {
      phoneRequiredErrorMessage = "* Phone field is required";
    }
    phoneInput.value = "";
    phoneInput.setAttribute("placeholder", "");
    phoneInput.setAttribute("placeholder", phoneRequiredErrorMessage);
    phoneInput.classList.add("sg-placeholder-red");
    phoneInput.style.setProperty("border-color", "#e73d4a", "important");
    hasError = true;
  }

  if (gdprRequired && !gdpr) {
    hasError = true;
    var gdprRequiredErrorMessage = gdprInput.getAttribute(
      "data-sgpm-contactform-gdpr-error-message-required"
    );
    if (!gdprRequiredErrorMessage || gdprRequiredErrorMessage == "undefined") {
      gdprRequiredErrorMessage = "* Please accept our terms.";
    }
    var errorMessage = document.createElement("DIV");
    errorMessage.innerHTML = "<span>" + gdprRequiredErrorMessage + "</span>";
    errorMessage.classList.add("sgpm-gdpr-checkbox-required-error");
    errorMessage.classList.add("sgpm-red");
    errorMessage.classList.add("sgpm-text-left");
    gdprContainer.appendChild(errorMessage);
  }

  if (nameRequired && !name) {
    var nameRequiredErrorMessage = nameInput.getAttribute(
      "data-sgpm-contactform-name-error-message-required"
    );
    if (!nameRequiredErrorMessage || nameRequiredErrorMessage == "undefined") {
      nameRequiredErrorMessage = "* Name field is required";
    }
    nameInput.value = "";
    nameInput.setAttribute("placeholder", "");
    nameInput.setAttribute("placeholder", nameRequiredErrorMessage);
    nameInput.classList.add("sg-placeholder-red");
    nameInput.style.setProperty("border-color", "#e73d4a", "important");
    hasError = true;
  }
  if (subjectRequired && !subject) {
    var subjectRequiredErrorMessage = subjectInput.getAttribute(
      "data-sgpm-contactform-subject-error-message-required"
    );
    if (
      !subjectRequiredErrorMessage ||
      subjectRequiredErrorMessage == "undefined"
    ) {
      subjectRequiredErrorMessage = "* Subject field is required";
    }
    subjectInput.value = "";
    subjectInput.setAttribute("placeholder", "");
    subjectInput.setAttribute("placeholder", subjectRequiredErrorMessage);
    subjectInput.classList.add("sg-placeholder-red");
    subjectInput.style.setProperty("border-color", "#e73d4a", "important");
    hasError = true;
  }
  if (messageRequired && !message) {
    var messageRequiredErrorMessage = messageInput.getAttribute(
      "data-sgpm-contactform-message-error-message-required"
    );
    if (
      !messageRequiredErrorMessage ||
      messageRequiredErrorMessage == "undefined"
    ) {
      messageRequiredErrorMessage = "* Message field is required";
    }
    messageInput.value = "";
    messageInput.setAttribute("placeholder", "");
    messageInput.setAttribute("placeholder", messageRequiredErrorMessage);
    messageInput.classList.add("sg-placeholder-red");
    messageInput.style.setProperty("border-color", "#e73d4a", "important");
    hasError = true;
  }
  /*Get button's default text which will be used inside responseFunction*/
  var btnText = btnElement.innerHTML;
  var loadingSpinner =
    '<svg id="pmls" style="width: 52px; height: 17px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="10"  r="6"><animate attributeName="opacity" begin=".1" dur="1s" repeatCount="indefinite" values="0;1;0"/></circle><circle cx="26" cy="10" r="6"><animate attributeName="opacity" begin=".2" dur="1s" repeatCount="indefinite" values="0;1;0"/></circle><circle cx="46" cy="10" r="6"><animate attributeName="opacity" begin=".3" dur="1s" repeatCount="indefinite" values="0;1;0"/></circle></svg>';

  if (!hasError) {
    btnElement.innerHTML = loadingSpinner;
    btnElement.setAttribute("disabled", "disabled");

    if (afterContactBehavior == "redirectUrl" && redirectNewTab == "true") {
      windowOpenNewTab = window.open(redirectUrl);
    }
    SGP.sendPostRequest(url, responseFunction, params);
  }
};

SGP.afterContact = function (pid, popupId, popupMainWrapper, windowOpenNewTab) {
  var emailInput = popupMainWrapper.querySelector(
    "#sg-contactform-email-input-" + pid
  );
  var afterContactBehavior = popupMainWrapper
    .querySelector(".sg-contactform-custom-option-data-" + pid)
    .getAttribute("data-after-contact-behavior");

  switch (afterContactBehavior) {
    case "showSuccessMessage":
      var successMessage = decodeURIComponent(
        popupMainWrapper
          .querySelector(".sg-contactform-custom-option-data-" + pid)
          .getAttribute("data-success-message")
      );
      var successMessageColor = popupMainWrapper
        .querySelector(".sg-contactform-custom-option-data-" + pid)
        .getAttribute("data-success-message-color");
      var successMessageFontsize = popupMainWrapper
        .querySelector(".sg-contactform-custom-option-data-" + pid)
        .getAttribute("data-success-message-fontsize");
      SGPM_MAIN_DIV.innerHTML =
        "<span id='sg-contactform-success-message'>" +
        successMessage +
        "</span>";
      SGPM_MAIN_DIV.style.textAlign = "center";
      document.getElementById("sg-contactform-success-message").style.color =
        successMessageColor;
      document.getElementById("sg-contactform-success-message").style.fontSize =
        successMessageFontsize;
      break;
    case "redirectUrl":
      var redirectUrl = popupMainWrapper
        .querySelector(".sg-contactform-custom-option-data-" + pid)
        .getAttribute("data-redirect-url");
      if (windowOpenNewTab) {
        SGPMPopup.getPopup(emailInput).close();
        windowOpenNewTab.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
      break;
    case "closePopup":
      SGPMPopup.getPopup(emailInput).close(true);
      break;
    case "spinPopup":
      if (SGPMSpinnerObjects[popupId] && SGPMSpinnerObjects[popupId].obj) {
        SGPMSpinnerObjects[popupId].obj.spin();
      }
      break;
  }
};

SGP.onClickButtonElement = function (pid, buttonElement) {
  var popupMainWrapper = "";
  var btnElement = buttonElement;
  var popupId = SGPM_POPUP_ID;
  if (btnElement) {
    while (btnElement.parentNode) {
      if (btnElement.parentNode == document) {
        break;
      }

      if (
        btnElement.parentNode.classList.contains("sgpm-popup-maker-wrapper")
      ) {
        popupMainWrapper = btnElement.parentNode;
        popupId = popupMainWrapper
          .querySelector("[data-sgpm-popup-id]")
          .getAttribute("data-sgpm-popup-id");
        popupHashId = popupMainWrapper
          .querySelector("[data-sgpm-popup-hash-id]")
          .getAttribute("data-sgpm-popup-hash-id");
        break;
      }
      btnElement = btnElement.parentNode;
    }
  }

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];

  var behaviorOption = buttonElement.getAttribute("data-sg-btn-behavior");
  var redirectionUrl = buttonElement.getAttribute("data-sg-redirect-url");
  var redirectionNewTab = buttonElement.getAttribute(
    "data-sg-redirect-new-tab"
  );
  var copiedText = buttonElement.getAttribute("data-sg-copy-text");
  var labelAfterCopyText = buttonElement.getAttribute(
    "data-sg-label-after-copy-text"
  );
  var btnStatisticsActions = buttonElement.getAttribute("data-sgpm-statistics");
  var openPopupId = buttonElement.getAttribute("data-sg-open-popup-id");
  var openOtherPopupCloseCurrent = buttonElement.getAttribute(
    "data-sg-open-popup-close-current"
  );

  if (!labelAfterCopyText) {
    labelAfterCopyText = "Copied!";
  }

  var cookieName = "sgpm-button-clicked-" + popupHashId;
  var cookieData = buttonElement.getAttribute(
    "data-sgpm-button-element-cookie-expires"
  );
  var sameOriginCookie = buttonElement.getAttribute(
    "data-sgpm-button-element-cookie-same-origin"
  );

  if (cookieData !== null) {
    var cookieDataAsJson = JSON.parse(cookieData);
    if (cookieDataAsJson.showOnlyOnce) {
      SGPMPopup.setCookieObject(
        cookieName,
        "true",
        parseInt(cookieDataAsJson.cookieExpires),
        false,
        sameOriginCookie
      );
    }
  }

  switch (behaviorOption) {
    case "redirectUrl":
      if (redirectionNewTab == "true") {
        SGPMPopup.getPopup(buttonElement).close(true);
        window.open(redirectionUrl);
      } else {
        /*Workaround for Firefox browser when window unload prevents other button click event for statistics*/
        if (typeof InstallTrigger !== "undefined") {
          if (typeof btnStatisticsActions != "undefined") {
            var jsonObject = JSON.parse(btnStatisticsActions);
            var elementName = jsonObject.name;
            if (SGPM_POPUP_STATISTICS[popupId]) {
              SGPM_POPUP_STATISTICS[popupId].trackAction("click", elementName);
            }
          }
        }
        window.location.href = redirectionUrl;
      }
      break;
    case "copyText":
      var textArea = document.createElement("textarea");
      textArea.value = copiedText;
      SGPM_MAIN_DIV.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      SGPM_MAIN_DIV.removeChild(textArea);
      buttonElement.innerHTML = labelAfterCopyText;
      break;
    case "closePopup":
      SGPMPopup.getPopup(buttonElement).close(true);
      break;
    case "spinPopup":
      if (SGPMSpinnerObjects[popupId] && SGPMSpinnerObjects[popupId].obj) {
        SGPMSpinnerObjects[popupId].obj.spin();
      }
      break;
    case "openPopup":
      if (openOtherPopupCloseCurrent == "true") {
        SGPMPopup.getPopup(buttonElement).close(true);
      }
      if (SGPMPopupLoader.popups[openPopupId]) {
        SGPMPopupLoader.popups[openPopupId].open(true, "fromPopup");
      }
      break;
    case "push":
      SGP.getPushNotifications(popupHashId);
      SGPMPopup.getPopup(buttonElement).close(true);
      break;
  }
};

SGP.getPushNotifications = function (hashId) {
  var newWindow = window.open(
    SGPM_WEBPUSH_URL + "index/view/?popup_hash_id=" + hashId,
    "Popup Maker Push Notification Window",
    "width=500,height=180"
  );

  /* custom value, then may be changed */
  var cookieExpires = 365;
  SGPMPopup.setCookie(
    "sgpm-push-notification-" + hashId,
    "true",
    cookieExpires
  );
};

SGP.sendPostRequest = function (url, responseHandler, params, isAsync) {
  var req;
  if (typeof isAsync === "undefined") {
    isAsync = true;
  }

  if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = function () {
    if (req.readyState == 4) {
      // only if req shows "loaded"
      if (req.status < 400) {
        // only if "OK"
        responseHandler(req, params);
      } else {
        //alert("There was a problem loading data :\n" + req.status+ "/" + req.statusText);
      }
    }
  };
  req.open("POST", url, isAsync);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.send(params);
};

SGP.htmlElement = function (popupId) {
  var htmlElements = document.querySelectorAll(
    '.sgpm-popup-maker-wrapper [data-sgpopuptype = "FEHtmlElement"][data-sg-popup-id = "' +
      popupId +
      '"]'
  );

  if ((popupId = "fromEditor")) {
    htmlElements = document.querySelectorAll(
      '.sgpm-popup-maker-wrapper [data-sgpopuptype = "FEHtmlElement"]'
    );
  }

  function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + "px";
  }

  if (htmlElements.length) {
    for (var i = 0; i < htmlElements.length; i++) {
      var pid = htmlElements[i].getAttribute("data-pid");
      var optionsInput = htmlElements[i].querySelector(
        ".sgpm-html-element-custom-option-data-" + pid
      );
      if (!optionsInput) continue;

      var asIframe = optionsInput.getAttribute("data-iframe");
      var iframeAutoHeight = optionsInput.getAttribute("data-auto-height");

      if (asIframe == "true") {
        var html = unescape(optionsInput.getAttribute("data-html"));
        var iframe = htmlElements[i].querySelector(
          "#sg-html-element-iframe-" + pid
        );
        iframedoc = iframe.contentDocument || iframe.contentWindow.document;

        if (iframedoc.readyState !== "loading") {
          iframedoc.open();
          iframedoc.write("<span></span>" + html);
          iframedoc.close();
        } else {
          iframedoc.addEventListener("DOMContentLoaded", function () {
            iframedoc.open();
            iframedoc.write("<span></span>" + html);
            iframedoc.close();
          });
        }

        if (iframeAutoHeight) {
          iframe.onload = function () {
            resizeIframe(iframe);
          };
        }
      }
    }
  }
};

SGP.initCountdown = function (mainDiv) {
  SGPM_IS_FINISHED_COUNTDOWN = false;
  // collect pids of html elements with countdown popup type
  var countdownElements = mainDiv.querySelectorAll(
    '[data-sgpopuptype = "FECountdownPopup"]'
  );
  if (countdownElements.length) {
    var pid = [];
    for (var i = 0; i < countdownElements.length; i++) {
      pid.push(countdownElements[i].getAttribute("data-pid"));
    }

    for (var i = 0; i < pid.length; i++) {
      SGP.countdown(mainDiv, pid[i]);
    }
  }
};

SGP.countdown = function (mainDiv, pid) {
  var countdownElement = mainDiv.querySelector("#sg-countdown-clock-" + pid);
  var type = countdownElement.getAttribute("data-type");
  var endtime = countdownElement.getAttribute("data-sg-date");
  var timeZone = countdownElement.getAttribute("data-sg-time-zone");
  var deadline = new Date(endtime);

  if (!isNaN(parseInt(endtime)) && type == "timer") {
    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + endtime * 1000);
  }

  SGP.initializeClock(
    "sg-countdown-clock-" + pid,
    deadline,
    timeZone,
    mainDiv,
    type
  );
};

SGP.initializeClock = function (id, endtime, timeZone, mainDiv, type) {
  var clock = mainDiv.querySelector("#" + id);
  var daysSpan = clock.querySelector(".days");
  var hoursSpan = clock.querySelector(".hours");
  var minutesSpan = clock.querySelector(".minutes");
  var secondsSpan = clock.querySelector(".seconds");
  var countdownPopupAlredyClosed = false;

  function updateClock() {
    var t = SGP.getTimeRemaining(endtime, timeZone, type);
    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
    minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
    secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
      if (!countdownPopupAlredyClosed) {
        SGPMPopup.getPopup(clock).close(true); // close popup after countdown timer elapsed
        countdownPopupAlredyClosed = true;
        SGPM_IS_FINISHED_COUNTDOWN = true;
      }

      daysSpan.innerHTML = "0";
      hoursSpan.innerHTML = "00";
      minutesSpan.innerHTML = "00";
      secondsSpan.innerHTML = "00";
    }
  }

  if (!countdownPopupAlredyClosed) {
    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
  }
};

SGP.getTimeRemaining = function (endtime, offset, type) {
  var d = new Date();
  var localTime = d.getTime();
  var localOffset = d.getTimezoneOffset() * 60000;
  var utc = localTime + localOffset;
  var t = Date.parse(endtime) - Date.parse(new Date(utc + 3600000 * offset));

  if (type == "timer") {
    t = Date.parse(endtime) - Date.parse(new Date());
  }

  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    total: t,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
};

SGP.initMaps = function () {
  var mapElements = document.querySelectorAll(
    '[data-sgpopuptype = "FEMapsElement"]'
  );

  if (mapElements.length) {
    var pid = [];

    for (var i = 0; i < mapElements.length; i++) {
      pid.push(mapElements[i].getAttribute("data-pid"));
    }

    for (var i = 0; i < pid.length; i++) {
      SGP.map(pid[i]);
    }
  }
};

SGP.map = function (pid) {
  var options = document.getElementById(
    "sgpm-maps-element-custom-option-data-" + pid
  );
  var apiKey = options.getAttribute("data-user-api-key");

  /** append required files */
  if (document.getElementById("sgpm-google-maps-init") === null) {
    var scriptCallback = SGP.initMapScripts(
      SGPM_APP_URL + "public/assets/lib/SGPMMaps.min.js",
      "sgpm-google-maps-init"
    );
    document.body.appendChild(scriptCallback);
  }

  if (document.getElementById("sgpm-google-maps-api") === null) {
    var scriptMapsAPI = SGP.initMapScripts(
      "https://maps.googleapis.com/maps/api/js?key=" +
        apiKey +
        "&libraries=places&callback=initMaps",
      "sgpm-google-maps-api"
    );
    document.body.appendChild(scriptMapsAPI);
  }
  /** reload google maps if it stack on script loading */
  SGP.reloadBrokenMap();
};

SGP.initMapScripts = function (source, id) {
  var script = document.createElement("script");

  var range = "http:|https://";
  var regexp = new RegExp(range, "gm");
  var match = regexp.test(source);

  if (match == true) {
    script.type = "text/javascript";
    script.src = source;
    script.id = id;
    script.async = true;
  } else {
    script.innerHTML = source;
  }

  return script;
};

SGP.reloadBrokenMap = function () {
  var gmapsKeepAlive = setInterval(function () {
    if (typeof initMaps === "function" && !SGPM_GMAPS_READY) {
      initMaps();
      return;
    }
    clearInterval(gmapsKeepAlive);
  }, 1000);
};

function sgpmPreventDefault(e) {
  e = e || window.event;
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
}

function sgpmPreventDefaultForScrollKeys(e) {
  var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

SGP.createCustomEvent = function (eventName, element) {
  var event;
  if (document.createEvent) {
    event = document.createEvent("HTMLEvents");
    event.initEvent(eventName, true, true);
    event.eventName = eventName;
    element.dispatchEvent(event);
  } else {
    event = document.createEventObject();
    event.eventName = eventName;
    event.eventType = eventName;
    element.fireEvent("on" + event.eventType, event);
  }
};

SGP.didOpenPopup = function (
  action,
  integrations,
  popupId,
  popupName,
  mainDiv,
  hashId,
  showingFrequency,
  disablePageScrolling
) {
  /* The popup opened event created */
  var eventName = "sgpm-popup-opened-" + hashId;
  SGP.createCustomEvent(eventName, mainDiv);

  if (disablePageScrolling) {
    SGPM_DISABLE_PAGE_SCROLLING_POPUP_COUNT++;
    document.body.style.cssText += " overflow-y: hidden !important";
    document.getElementsByTagName("html")[0].style.cssText +=
      " overflow: hidden !important";
  }

  /** popup show only once logic */
  if (showingFrequency && showingFrequency.enabled === "on") {
    var cname = "sgpm-" + hashId;
    var selectors = JSON.parse(showingFrequency.selectors);
    var exdays = selectors.expire;
    var sameOriginCookie = selectors.sameOriginCookie;
    SGPMPopup.setCookie(
      cname,
      "true",
      parseInt(exdays),
      selectors,
      sameOriginCookie
    );
  }

  /*
	if (SGP.iSIphone() || SGP.iSIpod() || SGP.iSIpad()) {
		document.documentElement.classList.add("sgpm-position-fixed");
	}
	*/

  var localStorageVal = {
    opened: true,
    count: 1,
  };
  var localFrequencyValue = SGPMPopup.getLocalStorage("sgpm-storage-" + hashId);

  if (localFrequencyValue) {
    var newValue = localFrequencyValue.count + 1;
    localStorageVal.count = newValue;
  }
  SGPMPopup.setLocalStorage("sgpm-storage-" + hashId, localStorageVal);

  SGPM_POPUP_OBJ[popupId] = { name: popupName, integrations: integrations };
  SGPM_POPUP_ID = popupId;
  SGPM_MAIN_DIV = mainDiv;

  SGP.htmlElement(popupId);
  SGPMSpinner.init(popupId, hashId);
  SGP.initCountdown(mainDiv);
  SGP.initMaps();
  SGP.setPopupDefaultHtml();
  SGP.changeSocialButtonsUrl(popupId, mainDiv);
  SGPMFacebook.initFacebookPageElement(popupId, mainDiv);

  var fbLikeButton = mainDiv.querySelector(".sgsocials-share-fbLike");
  if (fbLikeButton) {
    SGP.renderFbLikeButton();
  }

  var iframeElem = document.getElementsByClassName("sg-iframe-container");
  if (iframeElem[0] && SGP.iSMobile() && !SGP.iSAndroidPhone()) {
    iframeElem[0].style.setProperty("overflow-y", "scroll", "important");
  }

  var videoPopupConatiner = mainDiv.querySelectorAll(
    ".sg-video-popup-container"
  );
  if (videoPopupConatiner[0]) {
    for (var i = 0; i < videoPopupConatiner.length; i++) {
      var videoPopupElement = videoPopupConatiner[i];
      var videoIframeElem = videoPopupElement.querySelector("#sg-iframe");
      var autoPlay = videoIframeElem.getAttribute("data-sg-video-autoplay");

      if (autoPlay == "true" && videoIframeElem.src.indexOf("autoplay") < 0) {
        var videoIframeElemSrc = videoIframeElem.src;
        videoIframeElemSrc += "?autoplay=1";
        if (SGP.iSChrome()) {
          videoIframeElemSrc += "&mute=1&muted=1";
        }

        videoIframeElem.src = videoIframeElemSrc;
      }
    }
  }

  if (integrations.GoogleAnalytics) {
    /* tracking click on content */
    mainDiv.addEventListener("click", function () {
      var trackingAction = "On click content of popup";
      var clickPopupName = "On click " + popupName;
      SGGoogleAnalytics.eventTracking(trackingAction, clickPopupName);
    });

    /* indexOf returns -1 if the item is not found. */
    if (
      integrations.GoogleAnalytics.trackActions &&
      integrations.GoogleAnalytics.trackActions.indexOf(action) != -1
    ) {
      SGGoogleAnalytics.eventTracking(action, popupName);
    }
  }

  var location = window.location.href;
  /* if the popup hasn't opened for a screenshot, then count it in the statistics */
  if (
    location.substring(0, location.length - 8) !=
      "https://popupmaker.com/api/renderPopup/" &&
    location.substring(0, location.length - 12) !=
      "https://popupmaker.com/api/renderPopup/" &&
    !SGPM_IS_FINISHED_COUNTDOWN
  ) {
    SGStatistics.trackPopupOpeningAction(action, popupId);
  }
};

SGP.changeSocialButtonsUrl = function (popupId, mainDiv) {
  var socialButtonsConatiner = mainDiv.querySelectorAll(".sgsocials-share");

  if (socialButtonsConatiner[0]) {
    for (var i = 0; i < socialButtonsConatiner.length; i++) {
      var socialButtonConatiner = socialButtonsConatiner[i];
      var socialButtonsShareLink = socialButtonConatiner.querySelector(
        ".sgsocials-share-link"
      );

      if (!socialButtonsShareLink) continue;

      var shareLinkOnClickAttr = socialButtonsShareLink.getAttribute("onclick");
      var currentPageUrl = window.location.href;
      var onClickAttr = shareLinkOnClickAttr.replace(
        "%7BCurrentPageUrl%7D",
        currentPageUrl
      );
      socialButtonsShareLink.setAttribute("onclick", onClickAttr);
    }
  }
};

SGP.renderFbLikeButton = function () {
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");

  if (typeof FB !== "undefined") {
    FB.XFBML.parse();
  }
};

SGP.didClosePopup = function (mainDiv, popupId, disablePageScrolling, hashId) {
  /* The popup closed event created */
  var eventName = "sgpm-popup-closed-" + hashId;
  SGP.createCustomEvent(eventName, mainDiv);

  if (disablePageScrolling) {
    SGPM_DISABLE_PAGE_SCROLLING_POPUP_COUNT--;
    if (SGPM_DISABLE_PAGE_SCROLLING_POPUP_COUNT == 0) {
      document.body.style.cssText = SGPM_USER_PAGE_BODY_STYLES;
      document.getElementsByTagName("html")[0].style.cssText =
        SGPM_USER_PAGE_HTML_STYLES;
    }
  }

  if (SGP.iSIphone() || SGP.iSIpod() || SGP.iSIpad()) {
    document.documentElement.classList.remove("sgpm-position-fixed");
  }
  if (SGPM_MAIN_DIV_DEFAULT_CONTENT[popupId]) {
    mainDiv.innerHTML = SGPM_MAIN_DIV_DEFAULT_CONTENT[popupId];
  }

  /* stop video */
  SGP.stopVideo(mainDiv);
  /* Remove Facebook like event listeners */
  if (typeof window.FB === "object") {
    SGPMFacebook.removeEventListeners();
  }

  /* Send statistics data to or server */
  if (SGPM_POPUP_STATISTICS[popupId]) {
    if (
      typeof SGPM_POPUP_STATISTICS[popupId] !== "undefined" &&
      Object.keys(SGPM_POPUP_STATISTICS[popupId].dataToSend).length
    ) {
      setTimeout(function () {
        SGPM_POPUP_STATISTICS[popupId].sendData(true);
      }, 5);
    }
  }
};

SGP.setPopupDefaultHtml = function () {
  SGPM_MAIN_DIV_DEFAULT_CONTENT[SGPM_POPUP_ID] = SGPM_MAIN_DIV.innerHTML;
  SGPM_MAIN_DIV_OBJ[SGPM_POPUP_ID] = SGPM_MAIN_DIV;
};

SGP.getBrandingPanel = function (contentBox, branding) {
  var brandingPanel = document.createElement("a");
  var imageUrl =
    SGPM_APP_URL + "public/assets/media/images/popup-maker-icon-brand.png";
  var href = SGPM_APP_URL;
  if (typeof branding !== "undefined" && branding.imageUrl) {
    imageUrl = branding.imageUrl;
  }
  if (typeof branding !== "undefined" && branding.redirectUrl) {
    href = branding.redirectUrl;
  }

  brandingPanel.href = href;
  brandingPanel.target = "_blank";
  brandingPanel.title = "Popup Maker";
  brandingPanel.style.setProperty("display", "block", "important");
  brandingPanel.style.setProperty("position", "absolute", "important");
  brandingPanel.style.setProperty("right", "0px", "important");
  brandingPanel.style.setProperty("line-height", "0px", "important");
  brandingPanel.style.setProperty("width", "90px", "important");
  brandingPanel.style.setProperty("height", "20px", "important");

  if (contentBox.borderRadius) {
    if (
      parseInt(contentBox.borderRadius) > 1 ||
      typeof contentBox.borderRadius === "object"
    ) {
      if (
        typeof contentBox.borderRadius["bottomRight"] !== "undefined" &&
        contentBox.borderRadius["bottomRight"] > 1
      ) {
        brandingPanel.style.setProperty("right", "50%", "important");
        brandingPanel.style.setProperty("margin-right", "-45px", "important");
      }
    }
  }

  var brandingImg = document.createElement("IMG");
  brandingImg.setAttribute("src", imageUrl);
  brandingImg.setAttribute("alt", "Popup Maker Service");
  brandingImg.style.setProperty("width", "90px", "important");
  brandingImg.style.setProperty("height", "20px", "important");
  brandingImg.style.setProperty("display", "block", "important");

  brandingPanel.appendChild(brandingImg);
  return brandingPanel;
};

SGP.getPositionAbsoluteImage = function (imgSrc, className) {
  var image = document.createElement("Img");
  image.src = imgSrc;
  image.className = className;
  return image;
};

SGP.openingEvents = [
  "onLoad",
  "onExit",
  "onClick",
  "onHover",
  "onScroll",
  "inactivity",
  "clickOnFloatingButton",
  "fromPopup",
];

// SGStatistics class
function SGStatistics(statisticsLogId, popupId) {
  this.statisticsLogId = statisticsLogId;
  this.popupId = popupId;
  this.dataToSend = {};
  this.tmpArray = [];
  this.init();
}

SGStatistics.prototype.init = function () {
  var that = this;

  var popupId = that.popupId;
  var popupMainWrapper = "";
  var popupHiddenElement = document.querySelector(
    '[data-sgpm-popup-id="' + popupId + '"]'
  );

  /*We need to send data before browser closes*/
  window.addEventListener("unload", function (e) {
    if (SGPM_POPUP_STATISTICS[popupId]) {
      SGPM_POPUP_STATISTICS[popupId].sendData(false);
      return true;
    }
  });

  if (popupHiddenElement) {
    while (popupHiddenElement.parentNode) {
      if (popupHiddenElement.parentNode == document) {
        break;
      }

      if (
        popupHiddenElement.parentNode.classList.contains(
          "sgpm-popup-maker-wrapper"
        )
      ) {
        popupMainWrapper = popupHiddenElement.parentNode;
        break;
      }

      popupHiddenElement = popupHiddenElement.parentNode;
    }
  }

  var elementsToTrack = popupMainWrapper.querySelectorAll(
    "[data-sgpm-statistics]"
  );
  for (var i = 0; i < elementsToTrack.length; i++) {
    (function () {
      var elementToTrack = elementsToTrack[i];
      var attr = elementToTrack.getAttribute("data-sgpm-statistics");
      var jsonObject = JSON.parse(attr);
      var eventToTrack = jsonObject.event;
      var eventName = jsonObject.name;
      /*If multiple events*/
      if (Array.isArray(eventToTrack)) {
        for (var j = 0; j < eventToTrack.length; j++) {
          (function (j) {
            elementToTrack.addEventListener(
              eventToTrack[j],
              function (e) {
                that.trackAction(eventToTrack[j], eventName);
              },
              false
            );
          })(j);
        }
      } else {
      /*If single events*/
        elementToTrack.addEventListener(
          eventToTrack,
          function (e) {
            that.trackAction(eventToTrack, eventName);
          },
          false
        );
      }
    })();
  }
};

SGStatistics.prototype.trackAction = function (eventToTrack, eventName) {
  var statisticsLogId = this.statisticsLogId;
  var popupId = this.popupId;
  var structuredData = {
    event: eventToTrack,
    name: eventName,
    popupId: popupId,
  };
  this.tmpArray.push(structuredData);
  this.dataToSend[statisticsLogId] = this.tmpArray;
};

SGStatistics.prototype.sendData = function (isAsync) {
  var that = this;
  var statisticsLogId = this.statisticsLogId;
  /*If there is no event to send to server*/
  if (
    typeof that.dataToSend[statisticsLogId] !== "undefined" &&
    !that.dataToSend[statisticsLogId].length
  )
    return;
  var jsonData =
    "type=trackAction&trackedData=" +
    JSON.stringify(
      that.dataToSend
    ); /* to support application/x-www-form-urlencoded */
  var responseFunction = function (response, id) {
    SGPM_HAS_SEND_DATA = true;
  };

  SGPM_HAS_SEND_DATA = false;
  SGP.sendPostRequest(
    SGPM_STATS_URL + "api/v1/analytics/action",
    responseFunction,
    jsonData,
    isAsync
  );
  /*empty array to not send multiple times the same data*/
  that.empty();
};

SGStatistics.prototype.empty = function () {
  this.dataToSend[this.statisticsLogId] = {};
  this.tmpArray = [];
};

SGStatistics.trackPopupOpeningAction = function (action, popupId) {
  if (SGP.openingEvents.indexOf(action) === -1) return;

  var url = SGPM_STATS_URL + "api/v1/analytics/popupOpening";
  var currentPage = window.location.href;
  /*remove last slash*/
  if (currentPage.slice(-1) === "/") {
    currentPage = currentPage.slice(0, -1);
  }
  currentPageEncoded = encodeURIComponent(currentPage);

  var params =
    "type=trackPopupOpeningAction&action=" +
    action +
    "&popupId=" +
    popupId +
    "&currentPage=" +
    currentPageEncoded +
    "&referrerUrl=" +
    document.referrer;
  var responseFunction = function (response, id) {
    if(response.responseText!==""){
      var responseData = JSON.parse(response.responseText);

      if (typeof responseData.error !== "undefined") {
        console.log(responseData.error.message);
      }
      SGPM_POPUP_STATISTICS[popupId] = new SGStatistics(responseData.id, popupId);
    }
  };

  SGP.sendPostRequest(url, responseFunction, params);
};

/* SGIntegrations class */
function SGIntegrations() {}

SGIntegrations.init = function (integrations) {
  for (var name in integrations) {
    if (integrations.hasOwnProperty(name)) {
      eval("SG" + name).init(integrations[name]);
    }
  }
};

/* SGGoogleAnalytics class */
function SGGoogleAnalytics() {}

SGGoogleAnalytics.init = function (integration) {
  var accountNumber = integration.accountNumber;
  (function (i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
      i[r] ||
      function () {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    "script",
    "//www.google-analytics.com/analytics.js",
    "ga"
  );

  ga("create", accountNumber, "auto"); /* Replace with your property ID. */
};

SGGoogleAnalytics.eventTracking = function (action, popupName) {
  popupName = popupName
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  ga("send", "event", popupName, action, popupName, { nonInteraction: true });
};

/* Start spinner */
function sgpSpinToWin(t, e) {
  for (var i in ((defaultOptions = {
    canvasId: "canvas",
    centerX: null,
    centerY: null,
    outerRadius: null,
    innerRadius: 0,
    numSegments: 1,
    drawMode: "code",
    rotationAngle: 0,
    textFontFamily: "Arial",
    textFontSize: 20,
    textFontWeight: null,
    textOrientation: "horizontal",
    textAlignment: "center",
    textDirection: "normal",
    textMargin: null,
    textFillStyle: "black",
    textStrokeStyle: null,
    textLineWidth: 1,
    fillStyle: "silver",
    strokeStyle: "black",
    lineWidth: 1,
    clearTheCanvas: !0,
    imageOverlay: !1,
    drawText: !0,
    pointerAngle: 0,
    wheelImage: null,
    imageDirection: "N",
  }),
  defaultOptions))
    this[i] = null != t && void 0 !== t[i] ? t[i] : defaultOptions[i];
  if (null != t) for (i in t) void 0 === this[i] && (this[i] = t[i]);
  for (
    this.canvasId
      ? (this.canvas = document.getElementById(this.canvasId))
        ? (null == this.centerX && (this.centerX = this.canvas.width / 2),
          null == this.centerY && (this.centerY = this.canvas.height / 2),
          null == this.outerRadius &&
            (this.outerRadius =
              this.canvas.width < this.canvas.height
                ? this.canvas.width / 2 - this.lineWidth
                : this.canvas.height / 2 - this.lineWidth),
          (this.ctx = this.canvas.getContext("2d")))
        : (this.ctx = this.canvas = null)
      : (this.ctx = this.cavnas = null),
      this.segments = Array(null),
      x = 1;
    x <= this.numSegments;
    x++
  )
    this.segments[x] =
      null != t && t.segments && void 0 !== t.segments[x - 1]
        ? new Segment(t.segments[x - 1])
        : new Segment();
  if (
    (this.updateSegmentSizes(),
    null === this.textMargin && (this.textMargin = this.textFontSize / 1.7),
    (this.animation =
      null != t && t.animation && void 0 !== t.animation
        ? new Animation(t.animation)
        : new Animation()),
    null != t && t.pins && void 0 !== t.pins && (this.pins = new Pin(t.pins)),
    "image" == this.drawMode || "segmentImage" == this.drawMode
      ? (void 0 === t.fillStyle && (this.fillStyle = null),
        void 0 === t.strokeStyle && (this.strokeStyle = "red"),
        void 0 === t.drawText && (this.drawText = !1),
        void 0 === t.lineWidth && (this.lineWidth = 1),
        void 0 === e && (e = !1))
      : void 0 === e && (e = !0),
    (this.pointerGuide =
      null != t && t.pointerGuide && void 0 !== t.pointerGuide
        ? new PointerGuide(t.pointerGuide)
        : new PointerGuide()),
    1 == e)
  )
    this.draw(this.clearTheCanvas);
  else if ("segmentImage" == this.drawMode)
    for (
      sgpSpinToWinToDrawDuringAnimation = this,
        winhweelAlreadyDrawn = !1,
        y = 1;
      y <= this.numSegments;
      y++
    )
      null !== this.segments[y].image &&
        ((this.segments[y].imgData = new Image()),
        (this.segments[y].imgData.onload = sgpSpinToWinLoadedImage),
        (this.segments[y].imgData.src = this.segments[y].image));
}
function Pin(t) {
  for (var e in ((defaultOptions = {
    visible: !0,
    number: 36,
    outerRadius: 3,
    fillStyle: "grey",
    strokeStyle: "black",
    lineWidth: 1,
    margin: 3,
  }),
  defaultOptions))
    this[e] = null != t && void 0 !== t[e] ? t[e] : defaultOptions[e];
  if (null != t) for (e in t) void 0 === this[e] && (this[e] = t[e]);
}
function Animation(t) {
  for (var e in ((defaultOptions = {
    type: "spinOngoing",
    direction: "clockwise",
    propertyName: null,
    propertyValue: null,
    duration: 10,
    yoyo: !1,
    repeat: 0,
    easing: "power3.easeOut",
    stopAngle: null,
    spins: null,
    clearTheCanvas: null,
    callbackFinished: null,
    callbackBefore: null,
    callbackAfter: null,
  }),
  defaultOptions))
    this[e] = null != t && void 0 !== t[e] ? t[e] : defaultOptions[e];
  if (null != t) for (e in t) void 0 === this[e] && (this[e] = t[e]);
}
function Segment(t) {
  for (var e in ((defaultOptions = {
    size: null,
    text: "",
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    textFontFamily: null,
    textFontSize: null,
    textFontWeight: null,
    textOrientation: null,
    textAlignment: null,
    textDirection: null,
    textMargin: null,
    textFillStyle: null,
    textStrokeStyle: null,
    textLineWidth: null,
    image: null,
    imageDirection: null,
    imgData: null,
  }),
  defaultOptions))
    this[e] = null != t && void 0 !== t[e] ? t[e] : defaultOptions[e];
  if (null != t) for (e in t) void 0 === this[e] && (this[e] = t[e]);
  this.endAngle = this.startAngle = 0;
}
function PointerGuide(t) {
  for (var e in ((defaultOptions = {
    display: !1,
    strokeStyle: "red",
    lineWidth: 3,
  }),
  defaultOptions))
    this[e] = null != t && void 0 !== t[e] ? t[e] : defaultOptions[e];
}
function sgpSpinToWinPercentToDegrees(t) {
  var e = 0;
  return 0 < t && t <= 100 && (e = (t / 100) * 360), e;
}
function sgpSpinToWinAnimationLoop() {
  sgpSpinToWinToDrawDuringAnimation &&
    (0 != sgpSpinToWinToDrawDuringAnimation.animation.clearTheCanvas &&
      sgpSpinToWinToDrawDuringAnimation.ctx.clearRect(
        0,
        0,
        sgpSpinToWinToDrawDuringAnimation.canvas.width,
        sgpSpinToWinToDrawDuringAnimation.canvas.height
      ),
    null != sgpSpinToWinToDrawDuringAnimation.animation.callbackBefore &&
      sgpSpinToWinToDrawDuringAnimation.animation.callbackBefore()),
    sgpSpinToWinToDrawDuringAnimation.draw(!1),
    null != sgpSpinToWinToDrawDuringAnimation.animation.callbackAfter &&
      sgpSpinToWinToDrawDuringAnimation.animation.callbackAfter();
}
function sgpSpinToWinStopAnimation(t) {
  0 != t &&
    null != sgpSpinToWinToDrawDuringAnimation.animation.callbackFinished &&
    sgpSpinToWinToDrawDuringAnimation.animation.callbackFinished();
}
function sgpSpinToWinLoadedImage() {
  if (0 == winhweelAlreadyDrawn) {
    var t = 0;
    for (i = 1; i <= sgpSpinToWinToDrawDuringAnimation.numSegments; i++)
      null != sgpSpinToWinToDrawDuringAnimation.segments[i].imgData &&
        sgpSpinToWinToDrawDuringAnimation.segments[i].imgData.height &&
        t++;
    t == sgpSpinToWinToDrawDuringAnimation.numSegments &&
      ((winhweelAlreadyDrawn = !0), sgpSpinToWinToDrawDuringAnimation.draw());
  }
}
(sgpSpinToWin.prototype.updateSegmentSizes = function () {
  if (this.segments) {
    var t = 0,
      e = 0;
    for (x = 1; x <= this.numSegments; x++)
      null !== this.segments[x].size && ((t += this.segments[x].size), e++);
    var i = 360 - t;
    t = 0;
    for (
      0 < i && (t = i / (this.numSegments - e)), e = 0, x = 1;
      x <= this.numSegments;
      x++
    )
      (this.segments[x].startAngle = e),
        (e = this.segments[x].size ? e + this.segments[x].size : e + t),
        (this.segments[x].endAngle = e);
  }
}),
  (sgpSpinToWin.prototype.clearCanvas = function () {
    this.ctx && this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }),
  (sgpSpinToWin.prototype.draw = function (t) {
    this.ctx &&
      (void 0 !== t ? 1 == t && this.clearCanvas() : this.clearCanvas(),
      "image" == this.drawMode
        ? (this.drawWheelImage(),
          1 == this.drawText && this.drawSegmentText(),
          (1 == this.imageOverlay && this.drawSegments()) ||
            this.drawSegmentText())
        : "segmentImage" == this.drawMode
        ? (this.drawSegmentImages(),
          1 == this.drawText && this.drawSegmentText(),
          1 == this.imageOverlay && this.drawSegments())
        : (this.drawSegments(), 1 == this.drawText && this.drawSegmentText()),
      void 0 !== this.pins && 1 == this.pins.visible && this.drawPins(),
      1 == this.pointerGuide.display && this.drawPointerGuide());
  }),
  (sgpSpinToWin.prototype.drawPins = function () {
    if (this.pins && this.pins.number) {
      var t = 360 / this.pins.number;
      for (i = 1; i <= this.pins.number; i++)
        this.ctx.save(),
          (this.ctx.strokeStyle = this.pins.strokeStyle),
          (this.ctx.lineWidth = this.pins.lineWidth),
          (this.ctx.fillStyle = this.pins.fillStyle),
          this.ctx.translate(this.centerX, this.centerY),
          this.ctx.rotate(this.degToRad(i * t + this.rotationAngle)),
          this.ctx.translate(-this.centerX, -this.centerY),
          this.ctx.beginPath(),
          this.ctx.arc(
            this.centerX,
            this.centerY -
              this.outerRadius +
              this.pins.outerRadius +
              this.pins.margin,
            this.pins.outerRadius,
            0,
            2 * Math.PI
          ),
          this.pins.fillStyle && this.ctx.fill(),
          this.pins.strokeStyle && this.ctx.stroke(),
          this.ctx.restore();
    }
  }),
  (sgpSpinToWin.prototype.drawPointerGuide = function () {
    this.ctx &&
      (this.ctx.save(),
      this.ctx.translate(this.centerX, this.centerY),
      this.ctx.rotate(this.degToRad(this.pointerAngle)),
      this.ctx.translate(-this.centerX, -this.centerY),
      (this.ctx.strokeStyle = this.pointerGuide.strokeStyle),
      (this.ctx.lineWidth = this.pointerGuide.lineWidth),
      this.ctx.beginPath(),
      this.ctx.moveTo(this.centerX, this.centerY),
      this.ctx.lineTo(this.centerX, -this.outerRadius / 4),
      this.ctx.stroke(),
      this.ctx.restore());
  }),
  (sgpSpinToWin.prototype.drawWheelImage = function () {
    if (null != this.wheelImage) {
      var t = this.centerX - this.wheelImage.height / 2,
        e = this.centerY - this.wheelImage.width / 2;
      this.ctx.save(),
        this.ctx.translate(this.centerX, this.centerY),
        this.ctx.rotate(this.degToRad(this.rotationAngle)),
        this.ctx.translate(-this.centerX, -this.centerY),
        this.ctx.drawImage(this.wheelImage, t, e),
        this.ctx.restore();
    }
  }),
  (sgpSpinToWin.prototype.drawSegmentImages = function () {
    if (this.ctx && this.segments)
      for (x = 1; x <= this.numSegments; x++)
        if (((seg = this.segments[x]), seg.imgData.height)) {
          var t, e, i;
          (i =
            "S" ==
            (t =
              null !== seg.imageDirection
                ? seg.imageDirection
                : this.imageDirection)
              ? ((t = this.centerX - seg.imgData.width / 2),
                (e = this.centerY),
                seg.startAngle + 180 + (seg.endAngle - seg.startAngle) / 2)
              : "E" == t
              ? ((t = this.centerX),
                (e = this.centerY - seg.imgData.height / 2),
                seg.startAngle + 270 + (seg.endAngle - seg.startAngle) / 2)
              : "W" == t
              ? ((t = this.centerX - seg.imgData.width),
                (e = this.centerY - seg.imgData.height / 2),
                seg.startAngle + 90 + (seg.endAngle - seg.startAngle) / 2)
              : ((t = this.centerX - seg.imgData.width / 2),
                (e = this.centerY - seg.imgData.height),
                seg.startAngle + (seg.endAngle - seg.startAngle) / 2)),
            this.ctx.save(),
            this.ctx.translate(this.centerX, this.centerY),
            this.ctx.rotate(this.degToRad(this.rotationAngle + i)),
            this.ctx.translate(-this.centerX, -this.centerY),
            this.ctx.drawImage(seg.imgData, t, e),
            this.ctx.restore();
        } else console.log("Segment " + x + " imgData is not loaded");
  }),
  (sgpSpinToWin.prototype.drawSegments = function () {
    if (this.ctx && this.segments)
      for (x = 1; x <= this.numSegments; x++) {
        var t, e;
        (seg = this.segments[x]),
          (t = null !== seg.fillStyle ? seg.fillStyle : this.fillStyle),
          (this.ctx.fillStyle = t),
          (this.ctx.lineWidth =
            null !== seg.lineWidth ? seg.lineWidth : this.lineWidth),
          (e = null !== seg.strokeStyle ? seg.strokeStyle : this.strokeStyle),
          ((this.ctx.strokeStyle = e) || t) &&
            (this.ctx.beginPath(),
            this.innerRadius || this.ctx.moveTo(this.centerX, this.centerY),
            this.ctx.arc(
              this.centerX,
              this.centerY,
              this.outerRadius,
              this.degToRad(seg.startAngle + this.rotationAngle - 90),
              this.degToRad(seg.endAngle + this.rotationAngle - 90),
              !1
            ),
            this.innerRadius
              ? this.ctx.arc(
                  this.centerX,
                  this.centerY,
                  this.innerRadius,
                  this.degToRad(seg.endAngle + this.rotationAngle - 90),
                  this.degToRad(seg.startAngle + this.rotationAngle - 90),
                  !0
                )
              : this.ctx.lineTo(this.centerX, this.centerY),
            t && this.ctx.fill(),
            e && this.ctx.stroke());
      }
  }),
  (sgpSpinToWin.prototype.drawSegmentText = function () {
    var t, e, s, n, r, a, h, o, l, c, u;
    if (this.ctx)
      for (x = 1; x <= this.numSegments; x++) {
        if ((this.ctx.save(), (seg = this.segments[x]), seg.text))
          for (
            t =
              null !== seg.textFontFamily
                ? seg.textFontFamily
                : this.textFontFamily,
              e =
                null !== seg.textFontSize
                  ? seg.textFontSize
                  : this.textFontSize,
              s =
                null !== seg.textFontWeight
                  ? seg.textFontWeight
                  : this.textFontWeight,
              n =
                null !== seg.textOrientation
                  ? seg.textOrientation
                  : this.textOrientation,
              r =
                null !== seg.textAlignment
                  ? seg.textAlignment
                  : this.textAlignment,
              a =
                null !== seg.textDirection
                  ? seg.textDirection
                  : this.textDirection,
              h = null !== seg.textMargin ? seg.textMargin : this.textMargin,
              o =
                null !== seg.textFillStyle
                  ? seg.textFillStyle
                  : this.textFillStyle,
              l =
                null !== seg.textStrokeStyle
                  ? seg.textStrokeStyle
                  : this.textStrokeStyle,
              c =
                null !== seg.textLineWidth
                  ? seg.textLineWidth
                  : this.textLineWidth,
              u = "",
              null != s && (u += s + " "),
              null != e && (u += e + "px "),
              null != t && (u += t),
              this.ctx.font = u,
              this.ctx.fillStyle = o,
              this.ctx.strokeStyle = l,
              this.ctx.lineWidth = c,
              s = 0 - ((t = seg.text.split("\n")).length / 2) * e + e / 2,
              "curved" != n || ("inner" != r && "outer" != r) || (s = 0),
              i = 0;
            i < t.length;
            i++
          ) {
            if ("reversed" == a) {
              if ("horizontal" == n)
                (this.ctx.textAlign =
                  "inner" == r ? "right" : "outer" == r ? "left" : "center"),
                  (this.ctx.textBaseline = "middle"),
                  (c = this.degToRad(
                    seg.endAngle -
                      (seg.endAngle - seg.startAngle) / 2 +
                      this.rotationAngle -
                      90 -
                      180
                  )),
                  this.ctx.save(),
                  this.ctx.translate(this.centerX, this.centerY),
                  this.ctx.rotate(c),
                  this.ctx.translate(-this.centerX, -this.centerY),
                  "inner" == r
                    ? (o &&
                        this.ctx.fillText(
                          t[i],
                          this.centerX - this.innerRadius - h,
                          this.centerY + s
                        ),
                      l &&
                        this.ctx.strokeText(
                          t[i],
                          this.centerX - this.innerRadius - h,
                          this.centerY + s
                        ))
                    : "outer" == r
                    ? (o &&
                        this.ctx.fillText(
                          t[i],
                          this.centerX - this.outerRadius + h,
                          this.centerY + s
                        ),
                      l &&
                        this.ctx.strokeText(
                          t[i],
                          this.centerX - this.outerRadius + h,
                          this.centerY + s
                        ))
                    : (o &&
                        this.ctx.fillText(
                          t[i],
                          this.centerX -
                            this.innerRadius -
                            (this.outerRadius - this.innerRadius) / 2 -
                            h,
                          this.centerY + s
                        ),
                      l &&
                        this.ctx.strokeText(
                          t[i],
                          this.centerX -
                            this.innerRadius -
                            (this.outerRadius - this.innerRadius) / 2 -
                            h,
                          this.centerY + s
                        )),
                  this.ctx.restore();
              else if ("vertical" == n) {
                if (
                  ((this.ctx.textAlign = "center"),
                  (this.ctx.textBaseline =
                    "inner" == r ? "top" : "outer" == r ? "bottom" : "middle"),
                  (c =
                    seg.endAngle - (seg.endAngle - seg.startAngle) / 2 - 180),
                  (c += this.rotationAngle),
                  this.ctx.save(),
                  this.ctx.translate(this.centerX, this.centerY),
                  this.ctx.rotate(this.degToRad(c)),
                  this.ctx.translate(-this.centerX, -this.centerY),
                  "outer" == r)
                )
                  var _ = this.centerY + this.outerRadius - h;
                else "inner" == r && (_ = this.centerY + this.innerRadius + h);
                if (((u = e - e / 9), "outer" == r))
                  for (c = t[i].length - 1; 0 <= c; c--)
                    (character = t[i].charAt(c)),
                      o && this.ctx.fillText(character, this.centerX + s, _),
                      l && this.ctx.strokeText(character, this.centerX + s, _),
                      (_ -= u);
                else if ("inner" == r)
                  for (c = 0; c < t[i].length; c++)
                    (character = t[i].charAt(c)),
                      o && this.ctx.fillText(character, this.centerX + s, _),
                      l && this.ctx.strokeText(character, this.centerX + s, _),
                      (_ += u);
                else if ("center" == r)
                  for (
                    _ = 0,
                      1 < t[i].length && (_ = (u * (t[i].length - 1)) / 2),
                      _ =
                        this.centerY +
                        this.innerRadius +
                        (this.outerRadius - this.innerRadius) / 2 +
                        _ +
                        h,
                      c = t[i].length - 1;
                    0 <= c;
                    c--
                  )
                    (character = t[i].charAt(c)),
                      o && this.ctx.fillText(character, this.centerX + s, _),
                      l && this.ctx.strokeText(character, this.centerX + s, _),
                      (_ -= u);
                this.ctx.restore();
              } else if ("curved" == n) {
                (u = 0),
                  "inner" == r
                    ? ((u = this.innerRadius + h),
                      (this.ctx.textBaseline = "top"))
                    : "outer" == r
                    ? ((u = this.outerRadius - h),
                      (this.ctx.textBaseline = "bottom"),
                      (u -= e * (t.length - 1)))
                    : "center" == r &&
                      ((u =
                        this.innerRadius +
                        h +
                        (this.outerRadius - this.innerRadius) / 2),
                      (this.ctx.textBaseline = "middle"));
                var g,
                  p = 0;
                for (
                  1 < t[i].length
                    ? ((this.ctx.textAlign = "left"),
                      (p = (e / 10) * 4),
                      (radiusPercent = 100 / u),
                      (p *= radiusPercent),
                      (totalArc = p * t[i].length),
                      (g =
                        seg.startAngle +
                        ((seg.endAngle - seg.startAngle) / 2 - totalArc / 2)))
                    : ((g =
                        seg.startAngle + (seg.endAngle - seg.startAngle) / 2),
                      (this.ctx.textAlign = "center")),
                    g += this.rotationAngle,
                    g -= 180,
                    c = t[i].length;
                  0 <= c;
                  c--
                )
                  this.ctx.save(),
                    (character = t[i].charAt(c)),
                    this.ctx.translate(this.centerX, this.centerY),
                    this.ctx.rotate(this.degToRad(g)),
                    this.ctx.translate(-this.centerX, -this.centerY),
                    l &&
                      this.ctx.strokeText(
                        character,
                        this.centerX,
                        this.centerY + u + s
                      ),
                    o &&
                      this.ctx.fillText(
                        character,
                        this.centerX,
                        this.centerY + u + s
                      ),
                    (g += p),
                    this.ctx.restore();
              }
            } else if ("horizontal" == n)
              (this.ctx.textAlign =
                "inner" == r ? "left" : "outer" == r ? "right" : "center"),
                (this.ctx.textBaseline = "middle"),
                (c = this.degToRad(
                  seg.endAngle -
                    (seg.endAngle - seg.startAngle) / 2 +
                    this.rotationAngle -
                    90
                )),
                this.ctx.save(),
                this.ctx.translate(this.centerX, this.centerY),
                this.ctx.rotate(c),
                this.ctx.translate(-this.centerX, -this.centerY),
                "inner" == r
                  ? (o &&
                      this.ctx.fillText(
                        t[i],
                        this.centerX + this.innerRadius + h,
                        this.centerY + s
                      ),
                    l &&
                      this.ctx.strokeText(
                        t[i],
                        this.centerX + this.innerRadius + h,
                        this.centerY + s
                      ))
                  : "outer" == r
                  ? (o &&
                      this.ctx.fillText(
                        t[i],
                        this.centerX + this.outerRadius - h,
                        this.centerY + s
                      ),
                    l &&
                      this.ctx.strokeText(
                        t[i],
                        this.centerX + this.outerRadius - h,
                        this.centerY + s
                      ))
                  : (o &&
                      this.ctx.fillText(
                        t[i],
                        this.centerX +
                          this.innerRadius +
                          (this.outerRadius - this.innerRadius) / 2 +
                          h,
                        this.centerY + s
                      ),
                    l &&
                      this.ctx.strokeText(
                        t[i],
                        this.centerX +
                          this.innerRadius +
                          (this.outerRadius - this.innerRadius) / 2 +
                          h,
                        this.centerY + s
                      )),
                this.ctx.restore();
            else if ("vertical" == n) {
              if (
                ((this.ctx.textAlign = "center"),
                (this.ctx.textBaseline =
                  "inner" == r ? "bottom" : "outer" == r ? "top" : "middle"),
                (c = seg.endAngle - (seg.endAngle - seg.startAngle) / 2),
                (c += this.rotationAngle),
                this.ctx.save(),
                this.ctx.translate(this.centerX, this.centerY),
                this.ctx.rotate(this.degToRad(c)),
                this.ctx.translate(-this.centerX, -this.centerY),
                "outer" == r
                  ? (_ = this.centerY - this.outerRadius + h)
                  : "inner" == r && (_ = this.centerY - this.innerRadius - h),
                (u = e - e / 9),
                "outer" == r)
              )
                for (c = 0; c < t[i].length; c++)
                  (character = t[i].charAt(c)),
                    o && this.ctx.fillText(character, this.centerX + s, _),
                    l && this.ctx.strokeText(character, this.centerX + s, _),
                    (_ += u);
              else if ("inner" == r)
                for (c = t[i].length - 1; 0 <= c; c--)
                  (character = t[i].charAt(c)),
                    o && this.ctx.fillText(character, this.centerX + s, _),
                    l && this.ctx.strokeText(character, this.centerX + s, _),
                    (_ -= u);
              else if ("center" == r)
                for (
                  _ = 0,
                    1 < t[i].length && (_ = (u * (t[i].length - 1)) / 2),
                    _ =
                      this.centerY -
                      this.innerRadius -
                      (this.outerRadius - this.innerRadius) / 2 -
                      _ -
                      h,
                    c = 0;
                  c < t[i].length;
                  c++
                )
                  (character = t[i].charAt(c)),
                    o && this.ctx.fillText(character, this.centerX + s, _),
                    l && this.ctx.strokeText(character, this.centerX + s, _),
                    (_ += u);
              this.ctx.restore();
            } else if ("curved" == n)
              for (
                u = 0,
                  "inner" == r
                    ? ((u = this.innerRadius + h),
                      (this.ctx.textBaseline = "bottom"),
                      (u += e * (t.length - 1)))
                    : "outer" == r
                    ? ((u = this.outerRadius - h),
                      (this.ctx.textBaseline = "top"))
                    : "center" == r &&
                      ((u =
                        this.innerRadius +
                        h +
                        (this.outerRadius - this.innerRadius) / 2),
                      (this.ctx.textBaseline = "middle")),
                  p = 0,
                  1 < t[i].length
                    ? ((this.ctx.textAlign = "left"),
                      (p = (e / 10) * 4),
                      (radiusPercent = 100 / u),
                      (p *= radiusPercent),
                      (totalArc = p * t[i].length),
                      (g =
                        seg.startAngle +
                        ((seg.endAngle - seg.startAngle) / 2 - totalArc / 2)))
                    : ((g =
                        seg.startAngle + (seg.endAngle - seg.startAngle) / 2),
                      (this.ctx.textAlign = "center")),
                  g += this.rotationAngle,
                  c = 0;
                c < t[i].length;
                c++
              )
                this.ctx.save(),
                  (character = t[i].charAt(c)),
                  this.ctx.translate(this.centerX, this.centerY),
                  this.ctx.rotate(this.degToRad(g)),
                  this.ctx.translate(-this.centerX, -this.centerY),
                  l &&
                    this.ctx.strokeText(
                      character,
                      this.centerX,
                      this.centerY - u + s
                    ),
                  o &&
                    this.ctx.fillText(
                      character,
                      this.centerX,
                      this.centerY - u + s
                    ),
                  (g += p),
                  this.ctx.restore();
            s += e;
          }
        this.ctx.restore();
      }
  }),
  (sgpSpinToWin.prototype.degToRad = function (t) {
    return 0.017453292519943295 * t;
  }),
  (sgpSpinToWin.prototype.setCenter = function (t, e) {
    (this.centerX = t), (this.centerY = e);
  }),
  (sgpSpinToWin.prototype.addSegment = function (t, e) {
    var i;
    if (((newSegment = new Segment(t)), this.numSegments++, void 0 !== e)) {
      for (i = this.numSegments; e < i; i--)
        this.segments[i] = this.segments[i - 1];
      (this.segments[e] = newSegment), (i = e);
    } else
      (this.segments[this.numSegments] = newSegment), (i = this.numSegments);
    return this.updateSegmentSizes(), this.segments[i];
  }),
  (sgpSpinToWin.prototype.setCanvasId = function (t) {
    t
      ? ((this.canvasId = t),
        (this.canvas = document.getElementById(this.canvasId)) &&
          (this.ctx = this.canvas.getContext("2d")))
      : (this.canvas = this.ctx = this.canvasId = null);
  }),
  (sgpSpinToWin.prototype.deleteSegment = function (t) {
    if (1 < this.numSegments) {
      if (void 0 !== t)
        for (; t < this.numSegments; t++)
          this.segments[t] = this.segments[t + 1];
      (this.segments[this.numSegments] = void 0),
        this.numSegments--,
        this.updateSegmentSizes();
    }
  }),
  (sgpSpinToWin.prototype.windowToCanvas = function (t, e) {
    var i = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor(t - (this.canvas.width / i.width) * i.left),
      y: Math.floor(e - (this.canvas.height / i.height) * i.top),
    };
  }),
  (sgpSpinToWin.prototype.getSegmentAt = function (t, e) {
    var i = null,
      s = this.getSegmentNumberAt(t, e);
    return null !== s && (i = this.segments[s]), i;
  }),
  (sgpSpinToWin.prototype.getSegmentNumberAt = function (t, e) {
    var i, s, n, r;
    (s =
      (h = this.windowToCanvas(t, e)).x > this.centerX
        ? ((n = h.x - this.centerX), "R")
        : ((n = this.centerX - h.x), "L")),
      (i =
        h.y > this.centerY
          ? ((r = h.y - this.centerY), "B")
          : ((r = this.centerY - h.y), "T"));
    var a = (180 * Math.atan(r / n)) / Math.PI,
      h = 0;
    for (
      n = Math.sqrt(r * r + n * n),
        "T" == i && "R" == s
          ? (h = Math.round(90 - a))
          : "B" == i && "R" == s
          ? (h = Math.round(a + 90))
          : "B" == i && "L" == s
          ? (h = Math.round(90 - a + 180))
          : "T" == i && "L" == s && (h = Math.round(a + 270)),
        0 != this.rotationAngle &&
          (h -= s = this.getRotationPosition()) < 0 &&
          (h = 360 - Math.abs(h)),
        s = null,
        t = 1;
      t <= this.numSegments;
      t++
    )
      if (
        h >= this.segments[t].startAngle &&
        h <= this.segments[t].endAngle &&
        n >= this.innerRadius &&
        n <= this.outerRadius
      ) {
        s = t;
        break;
      }
    return s;
  }),
  (sgpSpinToWin.prototype.getIndicatedSegment = function () {
    var t = this.getIndicatedSegmentNumber();
    return this.segments[t];
  }),
  (sgpSpinToWin.prototype.getIndicatedSegmentNumber = function () {
    var t = 0,
      e = this.getRotationPosition();
    for (
      (e = Math.floor(this.pointerAngle - e)) < 0 && (e = 360 - Math.abs(e)),
        x = 1;
      x < this.segments.length;
      x++
    )
      if (e >= this.segments[x].startAngle && e <= this.segments[x].endAngle) {
        t = x;
        break;
      }
    return t;
  }),
  (sgpSpinToWin.prototype.getRotationPosition = function () {
    if (0 <= (e = this.rotationAngle)) {
      if (360 < e)
        var t = Math.floor(e / 360),
          e = e - 360 * t;
    } else e < -360 && (e -= 360 * (t = Math.ceil(e / 360))), (e = 360 + e);
    return e;
  }),
  (sgpSpinToWin.prototype.startAnimation = function () {
    if (this.animation) {
      this.computeAnimation(), (sgpSpinToWinToDrawDuringAnimation = this);
      var t = Array(null);
      (t[this.animation.propertyName] = this.animation.propertyValue),
        (t.yoyo = this.animation.yoyo),
        (t.repeat = this.animation.repeat),
        (t.ease = this.animation.easing),
        (t.onUpdate = sgpSpinToWinAnimationLoop),
        (t.onComplete = sgpSpinToWinStopAnimation),
        (this.sgpmtween = sgpHelper.to(this, this.animation.duration, t));
    }
  }),
  (sgpSpinToWin.prototype.stopAnimation = function (t) {
    sgpSpinToWinToDrawDuringAnimation &&
      (sgpSpinToWinToDrawDuringAnimation.sgpmtween.kill(),
      sgpSpinToWinStopAnimation(t)),
      (sgpSpinToWinToDrawDuringAnimation = this);
  }),
  (sgpSpinToWin.prototype.pauseAnimation = function () {
    this.sgpmtween && this.sgpmtween.pause();
  }),
  (sgpSpinToWin.prototype.resumeAnimation = function () {
    this.sgpmtween && this.sgpmtween.play();
  }),
  (sgpSpinToWin.prototype.computeAnimation = function () {
    this.animation &&
      ("spinOngoing" == this.animation.type
        ? ((this.animation.propertyName = "rotationAngle"),
          null == this.animation.spins && (this.animation.spins = 5),
          null == this.animation.repeat && (this.animation.repeat = -1),
          null == this.animation.easing &&
            (this.animation.easing = "Linear.easeNone"),
          null == this.animation.yoyo && (this.animation.yoyo = !1),
          (this.animation.propertyValue = 360 * this.animation.spins),
          "anti-clockwise" == this.animation.direction &&
            (this.animation.propertyValue = 0 - this.animation.propertyValue))
        : "spinToStop" == this.animation.type
        ? ((this.animation.propertyName = "rotationAngle"),
          null == this.animation.spins && (this.animation.spins = 5),
          null == this.animation.repeat && (this.animation.repeat = 0),
          null == this.animation.easing &&
            (this.animation.easing = "Power4.easeOut"),
          (this.animation._stopAngle =
            null == this.animation.stopAngle
              ? Math.floor(359 * Math.random())
              : 360 - this.animation.stopAngle + this.pointerAngle),
          null == this.animation.yoyo && (this.animation.yoyo = !1),
          (this.animation.propertyValue = 360 * this.animation.spins),
          "anti-clockwise" == this.animation.direction
            ? ((this.animation.propertyValue =
                0 - this.animation.propertyValue),
              (this.animation.propertyValue -= 360 - this.animation._stopAngle))
            : (this.animation.propertyValue += this.animation._stopAngle))
        : "spinAndBack" == this.animation.type &&
          ((this.animation.propertyName = "rotationAngle"),
          null == this.animation.spins && (this.animation.spins = 5),
          null == this.animation.repeat && (this.animation.repeat = 1),
          null == this.animation.easing &&
            (this.animation.easing = "Power2.easeInOut"),
          null == this.animation.yoyo && (this.animation.yoyo = !0),
          (this.animation._stopAngle =
            null == this.animation.stopAngle
              ? 0
              : 360 - this.animation.stopAngle),
          (this.animation.propertyValue = 360 * this.animation.spins),
          "anti-clockwise" == this.animation.direction
            ? ((this.animation.propertyValue =
                0 - this.animation.propertyValue),
              (this.animation.propertyValue -= 360 - this.animation._stopAngle))
            : (this.animation.propertyValue += this.animation._stopAngle)));
  }),
  (sgpSpinToWin.prototype.getRandomForSegment = function (t) {
    var e = 0;
    if (t)
      if (void 0 !== this.segments[t]) {
        var i = this.segments[t].startAngle;
        0 < (t = this.segments[t].endAngle - i - 2)
          ? (e = i + 1 + Math.floor(Math.random() * t))
          : console.log(
              "Segment size is too small to safely get random angle inside it"
            );
      } else console.log("Segment " + t + " undefined");
    else console.log("Segment number not specified");
    return e;
  }),
  (Segment.prototype.changeImage = function (t, e) {
    (this.image = t),
      (this.imgData = null),
      e && (this.imageDirection = e),
      (winhweelAlreadyDrawn = !1),
      (this.imgData = new Image()),
      (this.imgData.onload = sgpSpinToWinLoadedImage),
      (this.imgData.src = this.image);
  });
var sgpSpinToWinToDrawDuringAnimation = null,
  winhweelAlreadyDrawn = !1,
  _gsScope =
    "undefined" != typeof module &&
    module.exports &&
    "undefined" != typeof global
      ? global
      : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
  "use strict";
  _gsScope._gsDefine(
    "sgpHelper",
    ["core.sgpDraw", "core.sgpTimeing", "sgpHelperFree"],
    function (e, t, v) {
      var s = function (t, e, i) {
          v.call(this, t, e, i),
            (this._cycle = 0),
            (this._yoyo = !0 === this.vars.yoyo || !!this.vars.yoyoEase),
            (this._repeat = this.vars.repeat || 0),
            (this._repeatDelay = this.vars.repeatDelay || 0),
            this._repeat && this._uncache(!0),
            (this.render = s.prototype.render);
        },
        y = 1e-10,
        T = v._internals,
        i = (T.isSelector, T.isArray, (s.prototype = v.to({}, 0.1, {})));
      return (
        (s.version = "1.20.3"),
        (i.constructor = s),
        (i.kill()._gc = !1),
        (s.killsgpmTweensOf = s.killDelayedCallsTo = v.killsgpmTweensOf),
        (s.getsgpmTweensOf = v.getsgpmTweensOf),
        (s.lagSmoothing = v.lagSmoothing),
        (s.ticker = v.ticker),
        (s.render = v.render),
        (i.invalidate = function () {
          return (
            (this._yoyo = !0 === this.vars.yoyo || !!this.vars.yoyoEase),
            (this._repeat = this.vars.repeat || 0),
            (this._repeatDelay = this.vars.repeatDelay || 0),
            (this._yoyoEase = null),
            this._uncache(!0),
            v.prototype.invalidate.call(this)
          );
        }),
        (i.updateTo = function (t, e) {
          var i,
            s = this.ratio,
            n = this.vars.immediateRender || t.immediateRender;
          for (i in (e &&
            this._startTime < this._timeline._time &&
            ((this._startTime = this._timeline._time),
            this._uncache(!1),
            this._gc
              ? this._enabled(!0, !1)
              : this._timeline.insert(this, this._startTime - this._delay)),
          t))
            this.vars[i] = t[i];
          if (this._initted || n)
            if (e) (this._initted = !1), n && this.render(0, !0, !0);
            else if (
              (this._gc && this._enabled(!0, !1),
              this._notifyPluginsOfEnabled &&
                this._firstPT &&
                v._onPluginEvent("_onDisable", this),
              0.998 < this._time / this._duration)
            ) {
              var r = this._totalTime;
              this.render(0, !0, !1),
                (this._initted = !1),
                this.render(r, !0, !1);
            } else if (
              ((this._initted = !1), this._init(), 0 < this._time || n)
            )
              for (var a, h = 1 / (1 - s), o = this._firstPT; o; )
                (a = o.s + o.c), (o.c *= h), (o.s = a - o.c), (o = o._next);
          return this;
        }),
        (i.render = function (t, e, i) {
          this._initted ||
            (0 === this._duration && this.vars.repeat && this.invalidate());
          var s,
            n,
            r,
            a,
            h,
            o,
            l,
            c,
            u,
            _ = this._dirty ? this.totalDuration() : this._totalDuration,
            g = this._time,
            p = this._totalTime,
            m = this._cycle,
            d = this._duration,
            f = this._rawPrevTime;
          if (
            (_ - 1e-7 <= t && 0 <= t
              ? ((this._totalTime = _),
                (this._cycle = this._repeat),
                this._yoyo && 0 != (1 & this._cycle)
                  ? ((this._time = 0),
                    (this.ratio = this._ease._calcEnd
                      ? this._ease.getRatio(0)
                      : 0))
                  : ((this._time = d),
                    (this.ratio = this._ease._calcEnd
                      ? this._ease.getRatio(1)
                      : 1)),
                this._reversed ||
                  ((s = !0),
                  (n = "onComplete"),
                  (i = i || this._timeline.autoRemoveChildren)),
                0 === d &&
                  (this._initted || !this.vars.lazy || i) &&
                  (this._startTime === this._timeline._duration && (t = 0),
                  (f < 0 ||
                    (t <= 0 && -1e-7 <= t) ||
                    (f === y && "isPause" !== this.data)) &&
                    f !== t &&
                    ((i = !0), y < f && (n = "onReverseComplete")),
                  (this._rawPrevTime = c = !e || t || f === t ? t : y)))
              : t < 1e-7
              ? ((this._totalTime = this._time = this._cycle = 0),
                (this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0),
                (0 !== p || (0 === d && 0 < f)) &&
                  ((n = "onReverseComplete"), (s = this._reversed)),
                t < 0 &&
                  ((this._active = !1),
                  0 === d &&
                    (this._initted || !this.vars.lazy || i) &&
                    (0 <= f && (i = !0),
                    (this._rawPrevTime = c = !e || t || f === t ? t : y))),
                this._initted || (i = !0))
              : ((this._totalTime = this._time = t),
                0 !== this._repeat &&
                  ((a = d + this._repeatDelay),
                  (this._cycle = (this._totalTime / a) >> 0),
                  0 !== this._cycle &&
                    this._cycle === this._totalTime / a &&
                    p <= t &&
                    this._cycle--,
                  (this._time = this._totalTime - this._cycle * a),
                  this._yoyo &&
                    0 != (1 & this._cycle) &&
                    ((this._time = d - this._time),
                    (u = this._yoyoEase || this.vars.yoyoEase) &&
                      (this._yoyoEase ||
                        (!0 !== u || this._initted
                          ? (this._yoyoEase = u =
                              !0 === u
                                ? this._ease
                                : u instanceof Ease
                                ? u
                                : Ease.map[u])
                          : ((u = this.vars.ease),
                            (this._yoyoEase = u =
                              u
                                ? u instanceof Ease
                                  ? u
                                  : "function" == typeof u
                                  ? new Ease(u, this.vars.easeParams)
                                  : Ease.map[u] || v.defaultEase
                                : v.defaultEase))),
                      (this.ratio = u
                        ? 1 - u.getRatio((d - this._time) / d)
                        : 0))),
                  this._time > d
                    ? (this._time = d)
                    : this._time < 0 && (this._time = 0)),
                this._easeType && !u
                  ? ((h = this._time / d),
                    (1 === (o = this._easeType) || (3 === o && 0.5 <= h)) &&
                      (h = 1 - h),
                    3 === o && (h *= 2),
                    1 === (l = this._easePower)
                      ? (h *= h)
                      : 2 === l
                      ? (h *= h * h)
                      : 3 === l
                      ? (h *= h * h * h)
                      : 4 === l && (h *= h * h * h * h),
                    1 === o
                      ? (this.ratio = 1 - h)
                      : 2 === o
                      ? (this.ratio = h)
                      : this._time / d < 0.5
                      ? (this.ratio = h / 2)
                      : (this.ratio = 1 - h / 2))
                  : u || (this.ratio = this._ease.getRatio(this._time / d))),
            g !== this._time || i || m !== this._cycle)
          ) {
            if (!this._initted) {
              if ((this._init(), !this._initted || this._gc)) return;
              if (
                !i &&
                this._firstPT &&
                ((!1 !== this.vars.lazy && this._duration) ||
                  (this.vars.lazy && !this._duration))
              )
                return (
                  (this._time = g),
                  (this._totalTime = p),
                  (this._rawPrevTime = f),
                  (this._cycle = m),
                  T.lazysgpmTweens.push(this),
                  void (this._lazy = [t, e])
                );
              !this._time || s || u
                ? s &&
                  this._ease._calcEnd &&
                  !u &&
                  (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                : (this.ratio = this._ease.getRatio(this._time / d));
            }
            for (
              !1 !== this._lazy && (this._lazy = !1),
                this._active ||
                  (!this._paused &&
                    this._time !== g &&
                    0 <= t &&
                    (this._active = !0)),
                0 === p &&
                  (2 === this._initted && 0 < t && this._init(),
                  this._startAt &&
                    (0 <= t
                      ? this._startAt.render(t, !0, i)
                      : n || (n = "_dummyGS")),
                  this.vars.onStart &&
                    ((0 === this._totalTime && 0 !== d) ||
                      e ||
                      this._callback("onStart"))),
                r = this._firstPT;
              r;

            )
              r.f
                ? r.t[r.p](r.c * this.ratio + r.s)
                : (r.t[r.p] = r.c * this.ratio + r.s),
                (r = r._next);
            this._onUpdate &&
              (t < 0 &&
                this._startAt &&
                this._startTime &&
                this._startAt.render(t, !0, i),
              e ||
                ((this._totalTime !== p || n) && this._callback("onUpdate"))),
              this._cycle !== m &&
                (e ||
                  this._gc ||
                  (this.vars.onRepeat && this._callback("onRepeat"))),
              n &&
                ((this._gc && !i) ||
                  (t < 0 &&
                    this._startAt &&
                    !this._onUpdate &&
                    this._startTime &&
                    this._startAt.render(t, !0, i),
                  s &&
                    (this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                    (this._active = !1)),
                  !e && this.vars[n] && this._callback(n),
                  0 === d &&
                    this._rawPrevTime === y &&
                    c !== y &&
                    (this._rawPrevTime = 0)));
          } else
            p !== this._totalTime &&
              this._onUpdate &&
              (e || this._callback("onUpdate"));
        }),
        (s.to = function (t, e, i) {
          return new s(t, e, i);
        }),
        (i.progress = function (t, e) {
          return arguments.length
            ? this.totalTime(
                this.duration() *
                  (this._yoyo && 0 != (1 & this._cycle) ? 1 - t : t) +
                  this._cycle * (this._duration + this._repeatDelay),
                e
              )
            : this._time / this.duration();
        }),
        (i.totalProgress = function (t, e) {
          return arguments.length
            ? this.totalTime(this.totalDuration() * t, e)
            : this._totalTime / this.totalDuration();
        }),
        (i.time = function (t, e) {
          return arguments.length
            ? (this._dirty && this.totalDuration(),
              t > this._duration && (t = this._duration),
              this._yoyo && 0 != (1 & this._cycle)
                ? (t =
                    this._duration -
                    t +
                    this._cycle * (this._duration + this._repeatDelay))
                : 0 !== this._repeat &&
                  (t += this._cycle * (this._duration + this._repeatDelay)),
              this.totalTime(t, e))
            : this._time;
        }),
        (i.duration = function (t) {
          return arguments.length
            ? e.prototype.duration.call(this, t)
            : this._duration;
        }),
        (i.totalDuration = function (t) {
          return arguments.length
            ? -1 === this._repeat
              ? this
              : this.duration(
                  (t - this._repeat * this._repeatDelay) / (this._repeat + 1)
                )
            : (this._dirty &&
                ((this._totalDuration =
                  -1 === this._repeat
                    ? 999999999999
                    : this._duration * (this._repeat + 1) +
                      this._repeatDelay * this._repeat),
                (this._dirty = !1)),
              this._totalDuration);
        }),
        (i.repeat = function (t) {
          return arguments.length
            ? ((this._repeat = t), this._uncache(!0))
            : this._repeat;
        }),
        (i.repeatDelay = function (t) {
          return arguments.length
            ? ((this._repeatDelay = t), this._uncache(!0))
            : this._repeatDelay;
        }),
        (i.yoyo = function (t) {
          return arguments.length ? ((this._yoyo = t), this) : this._yoyo;
        }),
        s
      );
    },
    !0
  );
}),
  _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
  (function (_, g) {
    "use strict";
    var p = {},
      s = _.document,
      m = (_.GreenSockGlobals = _.GreenSockGlobals || _);
    if (!m.sgpHelperFree) {
      var t,
        e,
        i,
        d,
        f,
        n,
        r,
        v = function (t) {
          var e,
            i = t.split("."),
            s = m;
          for (e = 0; e < i.length; e++) s[i[e]] = s = s[i[e]] || {};
          return s;
        },
        u = v("com.greensock"),
        y = 1e-10,
        o = function (t) {
          var e,
            i = [],
            s = t.length;
          for (e = 0; e !== s; i.push(t[e++]));
          return i;
        },
        T = function () {},
        x =
          ((n = Object.prototype.toString),
          (r = n.call([])),
          function (t) {
            return (
              null != t &&
              (t instanceof Array ||
                ("object" == typeof t && !!t.push && n.call(t) === r))
            );
          }),
        w = {},
        S = function (h, o, l, c) {
          (this.sc = w[h] ? w[h].sc : []),
            ((w[h] = this).gsClass = null),
            (this.func = l);
          var u = [];
          (this.check = function (t) {
            for (var e, i, s, n, r = o.length, a = r; -1 < --r; )
              (e = w[o[r]] || new S(o[r], [])).gsClass
                ? ((u[r] = e.gsClass), a--)
                : t && e.sc.push(this);
            if (0 === a && l) {
              if (
                ((s = (i = ("com.greensock." + h).split(".")).pop()),
                (n = v(i.join("."))[s] = this.gsClass = l.apply(l, u)),
                c)
              )
                if (
                  ((m[s] = p[s] = n),
                  "undefined" != typeof module && module.exports)
                )
                  if (h === g)
                    for (r in ((module.exports = p[g] = n), p)) n[r] = p[r];
                  else p[g] && (p[g][s] = n);
                else
                  "function" == typeof define &&
                    define.amd &&
                    define(
                      (_.GreenSockAMDPath ? _.GreenSockAMDPath + "/" : "") +
                        h.split(".").pop(),
                      [],
                      function () {
                        return n;
                      }
                    );
              for (r = 0; r < this.sc.length; r++) this.sc[r].check();
            }
          }),
            this.check(!0);
        },
        a = (_._gsDefine = function (t, e, i, s) {
          return new S(t, e, i, s);
        }),
        A = (u._class = function (t, e, i) {
          return (
            (e = e || function () {}),
            a(
              t,
              [],
              function () {
                return e;
              },
              i
            ),
            e
          );
        });
      a.globals = m;
      var h = [0, 0, 1, 1],
        P = A(
          "easing.Ease",
          function (t, e, i, s) {
            (this._func = t),
              (this._type = i || 0),
              (this._power = s || 0),
              (this._params = e ? h.concat(e) : h);
          },
          !0
        ),
        k = (P.map = {}),
        l = (P.register = function (t, e, i, s) {
          for (
            var n,
              r,
              a,
              h,
              o = e.split(","),
              l = o.length,
              c = (i || "easeIn,easeOut,easeInOut").split(",");
            -1 < --l;

          )
            for (
              r = o[l],
                n = s ? A("easing." + r, null, !0) : u.easing[r] || {},
                a = c.length;
              -1 < --a;

            )
              (h = c[a]),
                (k[r + "." + h] =
                  k[h + r] =
                  n[h] =
                    t.getRatio ? t : t[h] || new t());
        });
      for (
        (i = P.prototype)._calcEnd = !1,
          i.getRatio = function (t) {
            if (this._func)
              return (
                (this._params[0] = t), this._func.apply(null, this._params)
              );
            var e = this._type,
              i = this._power,
              s = 1 === e ? 1 - t : 2 === e ? t : t < 0.5 ? 2 * t : 2 * (1 - t);
            return (
              1 === i
                ? (s *= s)
                : 2 === i
                ? (s *= s * s)
                : 3 === i
                ? (s *= s * s * s)
                : 4 === i && (s *= s * s * s * s),
              1 === e ? 1 - s : 2 === e ? s : t < 0.5 ? s / 2 : 1 - s / 2
            );
          },
          e = (t = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"]).length;
        -1 < --e;

      )
        (i = t[e] + ",Power" + e),
          l(new P(null, null, 1, e), i, "easeOut", !0),
          l(
            new P(null, null, 2, e),
            i,
            "easeIn" + (0 === e ? ",easeNone" : "")
          ),
          l(new P(null, null, 3, e), i, "easeInOut");
      (k.linear = u.easing.Linear.easeIn), (k.swing = u.easing.Quad.easeInOut);
      var D = A("events.EventDispatcher", function (t) {
        (this._listeners = {}), (this._eventTarget = t || this);
      });
      ((i = D.prototype).addEventListener = function (t, e, i, s, n) {
        n = n || 0;
        var r,
          a,
          h = this._listeners[t],
          o = 0;
        for (
          this !== d || f || d.wake(),
            null == h && (this._listeners[t] = h = []),
            a = h.length;
          -1 < --a;

        )
          (r = h[a]).c === e && r.s === i
            ? h.splice(a, 1)
            : 0 === o && r.pr < n && (o = a + 1);
        h.splice(o, 0, { c: e, s: i, up: s, pr: n });
      }),
        (i.removeEventListener = function (t, e) {
          var i,
            s = this._listeners[t];
          if (s)
            for (i = s.length; -1 < --i; )
              if (s[i].c === e) return void s.splice(i, 1);
        }),
        (i.dispatchEvent = function (t) {
          var e,
            i,
            s,
            n = this._listeners[t];
          if (n)
            for (
              1 < (e = n.length) && (n = n.slice(0)), i = this._eventTarget;
              -1 < --e;

            )
              (s = n[e]) &&
                (s.up
                  ? s.c.call(s.s || i, { type: t, target: i })
                  : s.c.call(s.s || i));
        });
      var R = _.requestsgpDrawFrame,
        b = _.cancelsgpDrawFrame,
        W =
          Date.now ||
          function () {
            return new Date().getTime();
          },
        X = W();
      for (e = (t = ["ms", "moz", "webkit", "o"]).length; -1 < --e && !R; )
        (R = _[t[e] + "RequestsgpDrawFrame"]),
          (b =
            _[t[e] + "CancelsgpDrawFrame"] ||
            _[t[e] + "CancelRequestsgpDrawFrame"]);
      A("Ticker", function (t, e) {
        var n,
          r,
          a,
          h,
          o,
          l = this,
          c = W(),
          i = !(!1 === e || !R) && "auto",
          u = 500,
          _ = 33,
          g = function (t) {
            var e,
              i,
              s = W() - X;
            u < s && (c += s - _),
              (X += s),
              (l.time = (X - c) / 1e3),
              (e = l.time - o),
              (!n || 0 < e || !0 === t) &&
                (l.frame++, (o += e + (h <= e ? 0.004 : h - e)), (i = !0)),
              !0 !== t && (a = r(g)),
              i && l.dispatchEvent("tick");
          };
        D.call(l),
          (l.time = l.frame = 0),
          (l.tick = function () {
            g(!0);
          }),
          (l.lagSmoothing = function (t, e) {
            if (!arguments.length) return u < 1e10;
            (u = t || 1e10), (_ = Math.min(e, u, 0));
          }),
          (l.sleep = function () {
            null != a &&
              (i && b ? b(a) : clearTimeout(a),
              (r = T),
              (a = null),
              l === d && (f = !1));
          }),
          (l.wake = function (t) {
            null !== a
              ? l.sleep()
              : t
              ? (c += -X + (X = W()))
              : 10 < l.frame && (X = W() - u + 5),
              (r =
                0 === n
                  ? T
                  : i && R
                  ? R
                  : function (t) {
                      return setTimeout(t, (1e3 * (o - l.time) + 1) | 0);
                    }),
              l === d && (f = !0),
              g(2);
          }),
          (l.fps = function (t) {
            if (!arguments.length) return n;
            (h = 1 / ((n = t) || 60)), (o = this.time + h), l.wake();
          }),
          (l.useRAF = function (t) {
            if (!arguments.length) return i;
            l.sleep(), (i = t), l.fps(n);
          }),
          l.fps(t),
          setTimeout(function () {
            "auto" === i &&
              l.frame < 5 &&
              "hidden" !== s.visibilityState &&
              l.useRAF(!1);
          }, 1500);
      }),
        ((i = u.Ticker.prototype = new u.events.EventDispatcher()).constructor =
          u.Ticker);
      var c = A("core.sgpDraw", function (t, e) {
        if (
          ((this.vars = e = e || {}),
          (this._duration = this._totalDuration = t || 0),
          (this._delay = Number(e.delay) || 0),
          (this._timeScale = 1),
          (this._active = !0 === e.immediateRender),
          (this.data = e.data),
          (this._reversed = !0 === e.reversed),
          $)
        ) {
          f || d.wake();
          var i = this.vars.useFrames ? H : $;
          i.add(this, i._time), this.vars.paused && this.paused(!0);
        }
      });
      (d = c.ticker = new u.Ticker()),
        ((i = c.prototype)._dirty = i._gc = i._initted = i._paused = !1),
        (i._totalTime = i._time = 0),
        (i._rawPrevTime = -1),
        (i._next = i._last = i._onUpdate = i._timeline = i.timeline = null),
        (i._paused = !1);
      var I = function () {
        f &&
          2e3 < W() - X &&
          ("hidden" !== s.visibilityState || !d.lagSmoothing()) &&
          d.wake();
        var t = setTimeout(I, 2e3);
        t.unref && t.unref();
      };
      I(),
        (i.play = function (t, e) {
          return null != t && this.seek(t, e), this.reversed(!1).paused(!1);
        }),
        (i.pause = function (t, e) {
          return null != t && this.seek(t, e), this.paused(!0);
        }),
        (i.resume = function (t, e) {
          return null != t && this.seek(t, e), this.paused(!1);
        }),
        (i.seek = function (t, e) {
          return this.totalTime(Number(t), !1 !== e);
        }),
        (i.restart = function (t, e) {
          return this.reversed(!1)
            .paused(!1)
            .totalTime(t ? -this._delay : 0, !1 !== e, !0);
        }),
        (i.reverse = function (t, e) {
          return (
            null != t && this.seek(t || this.totalDuration(), e),
            this.reversed(!0).paused(!1)
          );
        }),
        (i.render = function (t, e, i) {}),
        (i.invalidate = function () {
          return (
            (this._time = this._totalTime = 0),
            (this._initted = this._gc = !1),
            (this._rawPrevTime = -1),
            (!this._gc && this.timeline) || this._enabled(!0),
            this
          );
        }),
        (i.isActive = function () {
          var t,
            e = this._timeline,
            i = this._startTime;
          return (
            !e ||
            (!this._gc &&
              !this._paused &&
              e.isActive() &&
              (t = e.rawTime(!0)) >= i &&
              t < i + this.totalDuration() / this._timeScale - 1e-7)
          );
        }),
        (i._enabled = function (t, e) {
          return (
            f || d.wake(),
            (this._gc = !t),
            (this._active = this.isActive()),
            !0 !== e &&
              (t && !this.timeline
                ? this._timeline.add(this, this._startTime - this._delay)
                : !t && this.timeline && this._timeline._remove(this, !0)),
            !1
          );
        }),
        (i._kill = function (t, e) {
          return this._enabled(!1, !1);
        }),
        (i.kill = function (t, e) {
          return this._kill(t, e), this;
        }),
        (i._uncache = function (t) {
          for (var e = t ? this : this.timeline; e; )
            (e._dirty = !0), (e = e.timeline);
          return this;
        }),
        (i._swapSelfInParams = function (t) {
          for (var e = t.length, i = t.concat(); -1 < --e; )
            "{self}" === t[e] && (i[e] = this);
          return i;
        }),
        (i._callback = function (t) {
          var e = this.vars,
            i = e[t],
            s = e[t + "Params"],
            n = e[t + "Scope"] || e.callbackScope || this;
          switch (s ? s.length : 0) {
            case 0:
              i.call(n);
              break;
            case 1:
              i.call(n, s[0]);
              break;
            case 2:
              i.call(n, s[0], s[1]);
              break;
            default:
              i.apply(n, s);
          }
        }),
        (i.eventCallback = function (t, e, i, s) {
          if ("on" === (t || "").substr(0, 2)) {
            var n = this.vars;
            if (1 === arguments.length) return n[t];
            null == e
              ? delete n[t]
              : ((n[t] = e),
                (n[t + "Params"] =
                  x(i) && -1 !== i.join("").indexOf("{self}")
                    ? this._swapSelfInParams(i)
                    : i),
                (n[t + "Scope"] = s)),
              "onUpdate" === t && (this._onUpdate = e);
          }
          return this;
        }),
        (i.delay = function (t) {
          return arguments.length
            ? (this._timeline.smoothChildTiming &&
                this.startTime(this._startTime + t - this._delay),
              (this._delay = t),
              this)
            : this._delay;
        }),
        (i.duration = function (t) {
          return arguments.length
            ? ((this._duration = this._totalDuration = t),
              this._uncache(!0),
              this._timeline.smoothChildTiming &&
                0 < this._time &&
                this._time < this._duration &&
                0 !== t &&
                this.totalTime(this._totalTime * (t / this._duration), !0),
              this)
            : ((this._dirty = !1), this._duration);
        }),
        (i.totalDuration = function (t) {
          return (
            (this._dirty = !1),
            arguments.length ? this.duration(t) : this._totalDuration
          );
        }),
        (i.time = function (t, e) {
          return arguments.length
            ? (this._dirty && this.totalDuration(),
              this.totalTime(t > this._duration ? this._duration : t, e))
            : this._time;
        }),
        (i.totalTime = function (t, e, i) {
          if ((f || d.wake(), !arguments.length)) return this._totalTime;
          if (this._timeline) {
            if (
              (t < 0 && !i && (t += this.totalDuration()),
              this._timeline.smoothChildTiming)
            ) {
              this._dirty && this.totalDuration();
              var s = this._totalDuration,
                n = this._timeline;
              if (
                (s < t && !i && (t = s),
                (this._startTime =
                  (this._paused ? this._pauseTime : n._time) -
                  (this._reversed ? s - t : t) / this._timeScale),
                n._dirty || this._uncache(!1),
                n._timeline)
              )
                for (; n._timeline; )
                  n._timeline._time !==
                    (n._startTime + n._totalTime) / n._timeScale &&
                    n.totalTime(n._totalTime, !0),
                    (n = n._timeline);
            }
            this._gc && this._enabled(!0, !1),
              (this._totalTime === t && 0 !== this._duration) ||
                (F.length && J(), this.render(t, e, !1), F.length && J());
          }
          return this;
        }),
        (i.progress = i.totalProgress =
          function (t, e) {
            var i = this.duration();
            return arguments.length
              ? this.totalTime(i * t, e)
              : i
              ? this._time / i
              : this.ratio;
          }),
        (i.startTime = function (t) {
          return arguments.length
            ? (t !== this._startTime &&
                ((this._startTime = t),
                this.timeline &&
                  this.timeline._sortChildren &&
                  this.timeline.add(this, t - this._delay)),
              this)
            : this._startTime;
        }),
        (i.endTime = function (t) {
          return (
            this._startTime +
            (0 != t ? this.totalDuration() : this.duration()) / this._timeScale
          );
        }),
        (i.timeScale = function (t) {
          if (!arguments.length) return this._timeScale;
          var e, i;
          for (
            t = t || y,
              this._timeline &&
                this._timeline.smoothChildTiming &&
                ((i =
                  (e = this._pauseTime) || 0 === e
                    ? e
                    : this._timeline.totalTime()),
                (this._startTime =
                  i - ((i - this._startTime) * this._timeScale) / t)),
              this._timeScale = t,
              i = this.timeline;
            i && i.timeline;

          )
            (i._dirty = !0), i.totalDuration(), (i = i.timeline);
          return this;
        }),
        (i.reversed = function (t) {
          return arguments.length
            ? (t != this._reversed &&
                ((this._reversed = t),
                this.totalTime(
                  this._timeline && !this._timeline.smoothChildTiming
                    ? this.totalDuration() - this._totalTime
                    : this._totalTime,
                  !0
                )),
              this)
            : this._reversed;
        }),
        (i.paused = function (t) {
          if (!arguments.length) return this._paused;
          var e,
            i,
            s = this._timeline;
          return (
            t != this._paused &&
              s &&
              (f || t || d.wake(),
              (i = (e = s.rawTime()) - this._pauseTime),
              !t &&
                s.smoothChildTiming &&
                ((this._startTime += i), this._uncache(!1)),
              (this._pauseTime = t ? e : null),
              (this._paused = t),
              (this._active = this.isActive()),
              !t &&
                0 !== i &&
                this._initted &&
                this.duration() &&
                ((e = s.smoothChildTiming
                  ? this._totalTime
                  : (e - this._startTime) / this._timeScale),
                this.render(e, e === this._totalTime, !0))),
            this._gc && !t && this._enabled(!0, !1),
            this
          );
        });
      var C = A("core.sgpTimeing", function (t) {
        c.call(this, 0, t),
          (this.autoRemoveChildren = this.smoothChildTiming = !0);
      });
      ((i = C.prototype = new c()).constructor = C),
        (i.kill()._gc = !1),
        (i._first = i._last = i._recent = null),
        (i._sortChildren = !1),
        (i.add = i.insert =
          function (t, e, i, s) {
            var n, r;
            if (
              ((t._startTime = Number(e || 0) + t._delay),
              t._paused &&
                this !== t._timeline &&
                (t._pauseTime =
                  t._startTime +
                  (this.rawTime() - t._startTime) / t._timeScale),
              t.timeline && t.timeline._remove(t, !0),
              (t.timeline = t._timeline = this),
              t._gc && t._enabled(!0, !0),
              (n = this._last),
              this._sortChildren)
            )
              for (r = t._startTime; n && n._startTime > r; ) n = n._prev;
            return (
              n
                ? ((t._next = n._next), (n._next = t))
                : ((t._next = this._first), (this._first = t)),
              t._next ? (t._next._prev = t) : (this._last = t),
              (t._prev = n),
              (this._recent = t),
              this._timeline && this._uncache(!0),
              this
            );
          }),
        (i._remove = function (t, e) {
          return (
            t.timeline === this &&
              (e || t._enabled(!1, !0),
              t._prev
                ? (t._prev._next = t._next)
                : this._first === t && (this._first = t._next),
              t._next
                ? (t._next._prev = t._prev)
                : this._last === t && (this._last = t._prev),
              (t._next = t._prev = t.timeline = null),
              t === this._recent && (this._recent = this._last),
              this._timeline && this._uncache(!0)),
            this
          );
        }),
        (i.render = function (t, e, i) {
          var s,
            n = this._first;
          for (this._totalTime = this._time = this._rawPrevTime = t; n; )
            (s = n._next),
              (n._active || (t >= n._startTime && !n._paused && !n._gc)) &&
                (n._reversed
                  ? n.render(
                      (n._dirty ? n.totalDuration() : n._totalDuration) -
                        (t - n._startTime) * n._timeScale,
                      e,
                      i
                    )
                  : n.render((t - n._startTime) * n._timeScale, e, i)),
              (n = s);
        }),
        (i.rawTime = function () {
          return f || d.wake(), this._totalTime;
        });
      var O = A(
          "sgpHelperFree",
          function (t, e, i) {
            if (
              (c.call(this, e, i),
              (this.render = O.prototype.render),
              null == t)
            )
              throw "Cannot sgpmtween a null target.";
            this.target = t = "string" != typeof t ? t : O.selector(t) || t;
            var s,
              n,
              r,
              a =
                t.jquery ||
                (t.length &&
                  t !== _ &&
                  t[0] &&
                  (t[0] === _ || (t[0].nodeType && t[0].style && !t.nodeType))),
              h = this.vars.overwrite;
            if (
              ((this._overwrite = h =
                null == h
                  ? q[O.defaultOverwrite]
                  : "number" == typeof h
                  ? h >> 0
                  : q[h]),
              (a || t instanceof Array || (t.push && x(t))) &&
                "number" != typeof t[0])
            )
              for (
                this._targets = r = o(t),
                  this._propLookup = [],
                  this._siblings = [],
                  s = 0;
                s < r.length;
                s++
              )
                (n = r[s])
                  ? "string" != typeof n
                    ? n.length &&
                      n !== _ &&
                      n[0] &&
                      (n[0] === _ ||
                        (n[0].nodeType && n[0].style && !n.nodeType))
                      ? (r.splice(s--, 1), (this._targets = r = r.concat(o(n))))
                      : ((this._siblings[s] = Z(n, this, !1)),
                        1 === h &&
                          1 < this._siblings[s].length &&
                          et(n, this, null, 1, this._siblings[s]))
                    : "string" == typeof (n = r[s--] = O.selector(n)) &&
                      r.splice(s + 1, 1)
                  : r.splice(s--, 1);
            else
              (this._propLookup = {}),
                (this._siblings = Z(t, this, !1)),
                1 === h &&
                  1 < this._siblings.length &&
                  et(t, this, null, 1, this._siblings);
            (this.vars.immediateRender ||
              (0 === e &&
                0 === this._delay &&
                !1 !== this.vars.immediateRender)) &&
              ((this._time = -y), this.render(Math.min(0, -this._delay)));
          },
          !0
        ),
        Y = function (t) {
          return (
            t &&
            t.length &&
            t !== _ &&
            t[0] &&
            (t[0] === _ || (t[0].nodeType && t[0].style && !t.nodeType))
          );
        };
      ((i = O.prototype = new c()).constructor = O),
        (i.kill()._gc = !1),
        (i.ratio = 0),
        (i._firstPT = i._targets = i._overwrittenProps = i._startAt = null),
        (i._notifyPluginsOfEnabled = i._lazy = !1),
        (O.version = "1.20.3"),
        (O.defaultEase = i._ease = new P(null, null, 1, 1)),
        (O.defaultOverwrite = "auto"),
        (O.ticker = d),
        (O.autoSleep = 120),
        (O.lagSmoothing = function (t, e) {
          d.lagSmoothing(t, e);
        }),
        (O.selector =
          _.$ ||
          _.jQuery ||
          function (t) {
            var e = _.$ || _.jQuery;
            return e
              ? (O.selector = e)(t)
              : void 0 === s
              ? t
              : s.querySelectorAll
              ? s.querySelectorAll(t)
              : s.getElementById("#" === t.charAt(0) ? t.substr(1) : t);
          });
      var F = [],
        z = {},
        E = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
        M = /[\+-]=-?[\.\d]/,
        L = function (t) {
          for (var e, i = this._firstPT; i; )
            (e = i.blob
              ? 1 === t && null != this.end
                ? this.end
                : t
                ? this.join("")
                : this.start
              : i.c * t + i.s),
              i.m
                ? (e = i.m(e, this._target || i.t))
                : e < 1e-6 && -1e-6 < e && !i.blob && (e = 0),
              i.f ? (i.fp ? i.t[i.p](i.fp, e) : i.t[i.p](e)) : (i.t[i.p] = e),
              (i = i._next);
        },
        N = function (t, e, i, s) {
          var n,
            r,
            a,
            h,
            o,
            l,
            c,
            u = [],
            _ = 0,
            g = "",
            p = 0;
          for (
            u.start = t,
              u.end = e,
              t = u[0] = t + "",
              e = u[1] = e + "",
              i && (i(u), (t = u[0]), (e = u[1])),
              u.length = 0,
              n = t.match(E) || [],
              r = e.match(E) || [],
              s &&
                ((s._next = null), (s.blob = 1), (u._firstPT = u._applyPT = s)),
              o = r.length,
              h = 0;
            h < o;
            h++
          )
            (c = r[h]),
              (g += (l = e.substr(_, e.indexOf(c, _) - _)) || !h ? l : ","),
              (_ += l.length),
              p ? (p = (p + 1) % 5) : "rgba(" === l.substr(-5) && (p = 1),
              c === n[h] || n.length <= h
                ? (g += c)
                : (g && (u.push(g), (g = "")),
                  (a = parseFloat(n[h])),
                  u.push(a),
                  (u._firstPT = {
                    _next: u._firstPT,
                    t: u,
                    p: u.length - 1,
                    s: a,
                    c:
                      ("=" === c.charAt(1)
                        ? parseInt(c.charAt(0) + "1", 10) *
                          parseFloat(c.substr(2))
                        : parseFloat(c) - a) || 0,
                    f: 0,
                    m: p && p < 4 ? Math.round : 0,
                  })),
              (_ += c.length);
          return (
            (g += e.substr(_)) && u.push(g),
            (u.setRatio = L),
            M.test(e) && (u.end = null),
            u
          );
        },
        B = function (t, e, i, s, n, r, a, h, o) {
          "function" == typeof s && (s = s(o || 0, t));
          var l = typeof t[e],
            c =
              "function" !== l
                ? ""
                : e.indexOf("set") ||
                  "function" != typeof t["get" + e.substr(3)]
                ? e
                : "get" + e.substr(3),
            u = "get" !== i ? i : c ? (a ? t[c](a) : t[c]()) : t[e],
            _ = "string" == typeof s && "=" === s.charAt(1),
            g = {
              t: t,
              p: e,
              s: u,
              f: "function" === l,
              pg: 0,
              n: n || e,
              m: r ? ("function" == typeof r ? r : Math.round) : 0,
              pr: 0,
              c: _
                ? parseInt(s.charAt(0) + "1", 10) * parseFloat(s.substr(2))
                : parseFloat(s) - u || 0,
            };
          if (
            (("number" != typeof u || ("number" != typeof s && !_)) &&
              (a ||
              isNaN(u) ||
              (!_ && isNaN(s)) ||
              "boolean" == typeof u ||
              "boolean" == typeof s
                ? ((g.fp = a),
                  (g = {
                    t: N(
                      u,
                      _ ? parseFloat(g.s) + g.c : s,
                      h || O.defaultStringFilter,
                      g
                    ),
                    p: "setRatio",
                    s: 0,
                    c: 1,
                    f: 2,
                    pg: 0,
                    n: n || e,
                    pr: 0,
                    m: 0,
                  }))
                : ((g.s = parseFloat(u)),
                  _ || (g.c = parseFloat(s) - g.s || 0))),
            g.c)
          )
            return (
              (g._next = this._firstPT) && (g._next._prev = g),
              (this._firstPT = g)
            );
        },
        U = (O._internals = {
          isArray: x,
          isSelector: Y,
          lazysgpmTweens: F,
          blobDif: N,
        }),
        G = (O._plugins = {}),
        V = (U.sgpmtweenLookup = {}),
        j = 0,
        Q = (U.reservedProps = {
          ease: 1,
          delay: 1,
          overwrite: 1,
          onComplete: 1,
          onCompleteParams: 1,
          onCompleteScope: 1,
          useFrames: 1,
          runBackwards: 1,
          startAt: 1,
          onUpdate: 1,
          onUpdateParams: 1,
          onUpdateScope: 1,
          onStart: 1,
          onStartParams: 1,
          onStartScope: 1,
          onReverseComplete: 1,
          onReverseCompleteParams: 1,
          onReverseCompleteScope: 1,
          onRepeat: 1,
          onRepeatParams: 1,
          onRepeatScope: 1,
          easeParams: 1,
          yoyo: 1,
          immediateRender: 1,
          repeat: 1,
          repeatDelay: 1,
          data: 1,
          paused: 1,
          reversed: 1,
          autoCSS: 1,
          lazy: 1,
          onOverwrite: 1,
          callbackScope: 1,
          stringFilter: 1,
          id: 1,
          yoyoEase: 1,
        }),
        q = {
          none: 0,
          all: 1,
          auto: 2,
          concurrent: 3,
          allOnStart: 4,
          preexisting: 5,
          true: 1,
          false: 0,
        },
        H = (c._rootFramesTimeline = new C()),
        $ = (c._rootTimeline = new C()),
        K = 30,
        J = (U.lazyRender = function () {
          var t,
            e = F.length;
          for (z = {}; -1 < --e; )
            (t = F[e]) &&
              !1 !== t._lazy &&
              (t.render(t._lazy[0], t._lazy[1], !0), (t._lazy = !1));
          F.length = 0;
        });
      ($._startTime = d.time),
        (H._startTime = d.frame),
        ($._active = H._active = !0),
        setTimeout(J, 1),
        (c._updateRoot = O.render =
          function () {
            var t, e, i;
            if (
              (F.length && J(),
              $.render((d.time - $._startTime) * $._timeScale, !1, !1),
              H.render((d.frame - H._startTime) * H._timeScale, !1, !1),
              F.length && J(),
              d.frame >= K)
            ) {
              for (i in ((K = d.frame + (parseInt(O.autoSleep, 10) || 120)),
              V)) {
                for (t = (e = V[i].sgpmtweens).length; -1 < --t; )
                  e[t]._gc && e.splice(t, 1);
                0 === e.length && delete V[i];
              }
              if (
                (!(i = $._first) || i._paused) &&
                O.autoSleep &&
                !H._first &&
                1 === d._listeners.tick.length
              ) {
                for (; i && i._paused; ) i = i._next;
                i || d.sleep();
              }
            }
          }),
        d.addEventListener("tick", c._updateRoot);
      var Z = function (t, e, i) {
          var s,
            n,
            r = t._gssgpmTweenID;
          if (
            (V[r || (t._gssgpmTweenID = r = "t" + j++)] ||
              (V[r] = { target: t, sgpmtweens: [] }),
            e && (((s = V[r].sgpmtweens)[(n = s.length)] = e), i))
          )
            for (; -1 < --n; ) s[n] === e && s.splice(n, 1);
          return V[r].sgpmtweens;
        },
        tt = function (t, e, i, s) {
          var n,
            r,
            a = t.vars.onOverwrite;
          return (
            a && (n = a(t, e, i, s)),
            (a = O.onOverwrite) && (r = a(t, e, i, s)),
            !1 !== n && !1 !== r
          );
        },
        et = function (t, e, i, s, n) {
          var r, a, h, o;
          if (1 === s || 4 <= s) {
            for (o = n.length, r = 0; r < o; r++)
              if ((h = n[r]) !== e) h._gc || (h._kill(null, t, e) && (a = !0));
              else if (5 === s) break;
            return a;
          }
          var l,
            c = e._startTime + y,
            u = [],
            _ = 0,
            g = 0 === e._duration;
          for (r = n.length; -1 < --r; )
            (h = n[r]) === e ||
              h._gc ||
              h._paused ||
              (h._timeline !== e._timeline
                ? ((l = l || it(e, 0, g)), 0 === it(h, l, g) && (u[_++] = h))
                : h._startTime <= c &&
                  h._startTime + h.totalDuration() / h._timeScale > c &&
                  (((g || !h._initted) && c - h._startTime <= 2e-10) ||
                    (u[_++] = h)));
          for (r = _; -1 < --r; )
            if (
              ((h = u[r]),
              2 === s && h._kill(i, t, e) && (a = !0),
              2 !== s || (!h._firstPT && h._initted))
            ) {
              if (2 !== s && !tt(h, e)) continue;
              h._enabled(!1, !1) && (a = !0);
            }
          return a;
        },
        it = function (t, e, i) {
          for (
            var s = t._timeline, n = s._timeScale, r = t._startTime;
            s._timeline;

          ) {
            if (((r += s._startTime), (n *= s._timeScale), s._paused))
              return -100;
            s = s._timeline;
          }
          return e < (r /= n)
            ? r - e
            : (i && r === e) || (!t._initted && r - e < 2 * y)
            ? y
            : (r += t.totalDuration() / t._timeScale / n) > e + y
            ? 0
            : r - e - y;
        };
      (i._init = function () {
        var t,
          e,
          i,
          s,
          n,
          r,
          a = this.vars,
          h = this._overwrittenProps,
          o = this._duration,
          l = !!a.immediateRender,
          c = a.ease;
        if (a.startAt) {
          for (s in (this._startAt &&
            (this._startAt.render(-1, !0), this._startAt.kill()),
          (n = {}),
          a.startAt))
            n[s] = a.startAt[s];
          if (
            ((n.data = "isStart"),
            (n.overwrite = !1),
            (n.immediateRender = !0),
            (n.lazy = l && !1 !== a.lazy),
            (n.startAt = n.delay = null),
            (n.onUpdate = a.onUpdate),
            (n.onUpdateParams = a.onUpdateParams),
            (n.onUpdateScope = a.onUpdateScope || a.callbackScope || this),
            (this._startAt = O.to(this.target, 0, n)),
            l)
          )
            if (0 < this._time) this._startAt = null;
            else if (0 !== o) return;
        } else if (a.runBackwards && 0 !== o)
          if (this._startAt)
            this._startAt.render(-1, !0),
              this._startAt.kill(),
              (this._startAt = null);
          else {
            for (s in (0 !== this._time && (l = !1), (i = {}), a))
              (Q[s] && "autoCSS" !== s) || (i[s] = a[s]);
            if (
              ((i.overwrite = 0),
              (i.data = "isFromStart"),
              (i.lazy = l && !1 !== a.lazy),
              (i.immediateRender = l),
              (this._startAt = O.to(this.target, 0, i)),
              l)
            ) {
              if (0 === this._time) return;
            } else
              this._startAt._init(),
                this._startAt._enabled(!1),
                this.vars.immediateRender && (this._startAt = null);
          }
        if (
          ((this._ease = c =
            c
              ? c instanceof P
                ? c
                : "function" == typeof c
                ? new P(c, a.easeParams)
                : k[c] || O.defaultEase
              : O.defaultEase),
          a.easeParams instanceof Array &&
            c.config &&
            (this._ease = c.config.apply(c, a.easeParams)),
          (this._easeType = this._ease._type),
          (this._easePower = this._ease._power),
          (this._firstPT = null),
          this._targets)
        )
          for (r = this._targets.length, t = 0; t < r; t++)
            this._initProps(
              this._targets[t],
              (this._propLookup[t] = {}),
              this._siblings[t],
              h ? h[t] : null,
              t
            ) && (e = !0);
        else
          e = this._initProps(
            this.target,
            this._propLookup,
            this._siblings,
            h,
            0
          );
        if (
          (e && O._onPluginEvent("_onInitAllProps", this),
          h &&
            (this._firstPT ||
              ("function" != typeof this.target && this._enabled(!1, !1))),
          a.runBackwards)
        )
          for (i = this._firstPT; i; )
            (i.s += i.c), (i.c = -i.c), (i = i._next);
        (this._onUpdate = a.onUpdate), (this._initted = !0);
      }),
        (i._initProps = function (t, e, i, s, n) {
          var r, a, h, o, l, c;
          if (null == t) return !1;
          for (r in (z[t._gssgpmTweenID] && J(),
          this.vars.css ||
            (t.style &&
              t !== _ &&
              t.nodeType &&
              G.css &&
              !1 !== this.vars.autoCSS &&
              (function (t, e) {
                var i,
                  s = {};
                for (i in t)
                  Q[i] ||
                    (i in e &&
                      "transform" !== i &&
                      "x" !== i &&
                      "y" !== i &&
                      "width" !== i &&
                      "height" !== i &&
                      "className" !== i &&
                      "border" !== i) ||
                    !(!G[i] || (G[i] && G[i]._autoCSS)) ||
                    ((s[i] = t[i]), delete t[i]);
                t.css = s;
              })(this.vars, t)),
          this.vars))
            if (this.vars.hasOwnProperty(r))
              if (((c = this.vars[r]), Q[r]))
                c &&
                  (c instanceof Array || (c.push && x(c))) &&
                  -1 !== c.join("").indexOf("{self}") &&
                  (this.vars[r] = c = this._swapSelfInParams(c, this));
              else if (
                G[r] &&
                (o = new G[r]())._onInitsgpmTween(t, this.vars[r], this, n)
              ) {
                for (
                  this._firstPT = l =
                    {
                      _next: this._firstPT,
                      t: o,
                      p: "setRatio",
                      s: 0,
                      c: 1,
                      f: 1,
                      n: r,
                      pg: 1,
                      pr: o._priority,
                      m: 0,
                    },
                    a = o._overwriteProps.length;
                  -1 < --a;

                )
                  e[o._overwriteProps[a]] = this._firstPT;
                (o._priority || o._onInitAllProps) && (h = !0),
                  (o._onDisable || o._onEnable) &&
                    (this._notifyPluginsOfEnabled = !0),
                  l._next && (l._next._prev = l);
              } else
                e[r] = B.call(
                  this,
                  t,
                  r,
                  "get",
                  c,
                  r,
                  0,
                  null,
                  this.vars.stringFilter,
                  n
                );
          return s && this._kill(s, t)
            ? this._initProps(t, e, i, s, n)
            : 1 < this._overwrite &&
              this._firstPT &&
              1 < i.length &&
              et(t, this, e, this._overwrite, i)
            ? (this._kill(e, t), this._initProps(t, e, i, s, n))
            : (this._firstPT &&
                ((!1 !== this.vars.lazy && this._duration) ||
                  (this.vars.lazy && !this._duration)) &&
                (z[t._gssgpmTweenID] = !0),
              h);
        }),
        (i.render = function (t, e, i) {
          var s,
            n,
            r,
            a,
            h = this._time,
            o = this._duration,
            l = this._rawPrevTime;
          if (o - 1e-7 <= t && 0 <= t)
            (this._totalTime = this._time = o),
              (this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1),
              this._reversed ||
                ((s = !0),
                (n = "onComplete"),
                (i = i || this._timeline.autoRemoveChildren)),
              0 === o &&
                (this._initted || !this.vars.lazy || i) &&
                (this._startTime === this._timeline._duration && (t = 0),
                (l < 0 ||
                  (t <= 0 && -1e-7 <= t) ||
                  (l === y && "isPause" !== this.data)) &&
                  l !== t &&
                  ((i = !0), y < l && (n = "onReverseComplete")),
                (this._rawPrevTime = a = !e || t || l === t ? t : y));
          else if (t < 1e-7)
            (this._totalTime = this._time = 0),
              (this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0),
              (0 !== h || (0 === o && 0 < l)) &&
                ((n = "onReverseComplete"), (s = this._reversed)),
              t < 0 &&
                ((this._active = !1),
                0 === o &&
                  (this._initted || !this.vars.lazy || i) &&
                  (0 <= l && (l !== y || "isPause" !== this.data) && (i = !0),
                  (this._rawPrevTime = a = !e || t || l === t ? t : y))),
              (!this._initted || (this._startAt && this._startAt.progress())) &&
                (i = !0);
          else if (((this._totalTime = this._time = t), this._easeType)) {
            var c = t / o,
              u = this._easeType,
              _ = this._easePower;
            (1 === u || (3 === u && 0.5 <= c)) && (c = 1 - c),
              3 === u && (c *= 2),
              1 === _
                ? (c *= c)
                : 2 === _
                ? (c *= c * c)
                : 3 === _
                ? (c *= c * c * c)
                : 4 === _ && (c *= c * c * c * c),
              (this.ratio =
                1 === u
                  ? 1 - c
                  : 2 === u
                  ? c
                  : t / o < 0.5
                  ? c / 2
                  : 1 - c / 2);
          } else this.ratio = this._ease.getRatio(t / o);
          if (this._time !== h || i) {
            if (!this._initted) {
              if ((this._init(), !this._initted || this._gc)) return;
              if (
                !i &&
                this._firstPT &&
                ((!1 !== this.vars.lazy && this._duration) ||
                  (this.vars.lazy && !this._duration))
              )
                return (
                  (this._time = this._totalTime = h),
                  (this._rawPrevTime = l),
                  F.push(this),
                  void (this._lazy = [t, e])
                );
              this._time && !s
                ? (this.ratio = this._ease.getRatio(this._time / o))
                : s &&
                  this._ease._calcEnd &&
                  (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1));
            }
            for (
              !1 !== this._lazy && (this._lazy = !1),
                this._active ||
                  (!this._paused &&
                    this._time !== h &&
                    0 <= t &&
                    (this._active = !0)),
                0 === h &&
                  (this._startAt &&
                    (0 <= t
                      ? this._startAt.render(t, !0, i)
                      : n || (n = "_dummyGS")),
                  this.vars.onStart &&
                    ((0 === this._time && 0 !== o) ||
                      e ||
                      this._callback("onStart"))),
                r = this._firstPT;
              r;

            )
              r.f
                ? r.t[r.p](r.c * this.ratio + r.s)
                : (r.t[r.p] = r.c * this.ratio + r.s),
                (r = r._next);
            this._onUpdate &&
              (t < 0 &&
                this._startAt &&
                -1e-4 !== t &&
                this._startAt.render(t, !0, i),
              e ||
                ((this._time !== h || s || i) && this._callback("onUpdate"))),
              n &&
                ((this._gc && !i) ||
                  (t < 0 &&
                    this._startAt &&
                    !this._onUpdate &&
                    -1e-4 !== t &&
                    this._startAt.render(t, !0, i),
                  s &&
                    (this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                    (this._active = !1)),
                  !e && this.vars[n] && this._callback(n),
                  0 === o &&
                    this._rawPrevTime === y &&
                    a !== y &&
                    (this._rawPrevTime = 0)));
          }
        }),
        (i._kill = function (t, e, i) {
          if (
            ("all" === t && (t = null),
            null == t && (null == e || e === this.target))
          )
            return (this._lazy = !1), this._enabled(!1, !1);
          e =
            "string" != typeof e
              ? e || this._targets || this.target
              : O.selector(e) || e;
          var s,
            n,
            r,
            a,
            h,
            o,
            l,
            c,
            u,
            _ =
              i &&
              this._time &&
              i._startTime === this._startTime &&
              this._timeline === i._timeline;
          if ((x(e) || Y(e)) && "number" != typeof e[0])
            for (s = e.length; -1 < --s; ) this._kill(t, e[s], i) && (o = !0);
          else {
            if (this._targets) {
              for (s = this._targets.length; -1 < --s; )
                if (e === this._targets[s]) {
                  (h = this._propLookup[s] || {}),
                    (this._overwrittenProps = this._overwrittenProps || []),
                    (n = this._overwrittenProps[s] =
                      t ? this._overwrittenProps[s] || {} : "all");
                  break;
                }
            } else {
              if (e !== this.target) return !1;
              (h = this._propLookup),
                (n = this._overwrittenProps =
                  t ? this._overwrittenProps || {} : "all");
            }
            if (h) {
              if (
                ((l = t || h),
                (c =
                  t !== n &&
                  "all" !== n &&
                  t !== h &&
                  ("object" != typeof t || !t._tempKill)),
                i && (O.onOverwrite || this.vars.onOverwrite))
              ) {
                for (r in l) h[r] && (u || (u = []), u.push(r));
                if ((u || !t) && !tt(this, i, e, u)) return !1;
              }
              for (r in l)
                (a = h[r]) &&
                  (_ && (a.f ? a.t[a.p](a.s) : (a.t[a.p] = a.s), (o = !0)),
                  a.pg && a.t._kill(l) && (o = !0),
                  (a.pg && 0 !== a.t._overwriteProps.length) ||
                    (a._prev
                      ? (a._prev._next = a._next)
                      : a === this._firstPT && (this._firstPT = a._next),
                    a._next && (a._next._prev = a._prev),
                    (a._next = a._prev = null)),
                  delete h[r]),
                  c && (n[r] = 1);
              !this._firstPT && this._initted && this._enabled(!1, !1);
            }
          }
          return o;
        }),
        (i.invalidate = function () {
          return (
            this._notifyPluginsOfEnabled &&
              O._onPluginEvent("_onDisable", this),
            (this._firstPT =
              this._overwrittenProps =
              this._startAt =
              this._onUpdate =
                null),
            (this._notifyPluginsOfEnabled = this._active = this._lazy = !1),
            (this._propLookup = this._targets ? {} : []),
            c.prototype.invalidate.call(this),
            this.vars.immediateRender &&
              ((this._time = -y), this.render(Math.min(0, -this._delay))),
            this
          );
        }),
        (i._enabled = function (t, e) {
          if ((f || d.wake(), t && this._gc)) {
            var i,
              s = this._targets;
            if (s)
              for (i = s.length; -1 < --i; )
                this._siblings[i] = Z(s[i], this, !0);
            else this._siblings = Z(this.target, this, !0);
          }
          return (
            c.prototype._enabled.call(this, t, e),
            !(!this._notifyPluginsOfEnabled || !this._firstPT) &&
              O._onPluginEvent(t ? "_onEnable" : "_onDisable", this)
          );
        }),
        (O.to = function (t, e, i) {
          return new O(t, e, i);
        }),
        (O.from = function (t, e, i) {
          return (
            (i.runBackwards = !0),
            (i.immediateRender = 0 != i.immediateRender),
            new O(t, e, i)
          );
        }),
        (O.fromTo = function (t, e, i, s) {
          return (
            (s.startAt = i),
            (s.immediateRender =
              0 != s.immediateRender && 0 != i.immediateRender),
            new O(t, e, s)
          );
        }),
        (O.delayedCall = function (t, e, i, s, n) {
          return new O(e, 0, {
            delay: t,
            onComplete: e,
            onCompleteParams: i,
            callbackScope: s,
            onReverseComplete: e,
            onReverseCompleteParams: i,
            immediateRender: !1,
            lazy: !1,
            useFrames: n,
            overwrite: 0,
          });
        }),
        (O.set = function (t, e) {
          return new O(t, 0, e);
        }),
        (O.getsgpmTweensOf = function (t, e) {
          if (null == t) return [];
          var i, s, n, r;
          if (
            ((t = "string" != typeof t ? t : O.selector(t) || t),
            (x(t) || Y(t)) && "number" != typeof t[0])
          ) {
            for (i = t.length, s = []; -1 < --i; )
              s = s.concat(O.getsgpmTweensOf(t[i], e));
            for (i = s.length; -1 < --i; )
              for (r = s[i], n = i; -1 < --n; ) r === s[n] && s.splice(i, 1);
          } else if (t._gssgpmTweenID)
            for (i = (s = Z(t).concat()).length; -1 < --i; )
              (s[i]._gc || (e && !s[i].isActive())) && s.splice(i, 1);
          return s || [];
        }),
        (O.killsgpmTweensOf = O.killDelayedCallsTo =
          function (t, e, i) {
            "object" == typeof e && ((i = e), (e = !1));
            for (var s = O.getsgpmTweensOf(t, e), n = s.length; -1 < --n; )
              s[n]._kill(i, t);
          });
      var st = A(
        "plugins.sgpmTweenPlugin",
        function (t, e) {
          (this._overwriteProps = (t || "").split(",")),
            (this._propName = this._overwriteProps[0]),
            (this._priority = e || 0),
            (this._super = st.prototype);
        },
        !0
      );
      if (
        ((i = st.prototype),
        (st.version = "1.19.0"),
        (st.API = 2),
        (i._firstPT = null),
        (i._addsgpmTween = B),
        (i.setRatio = L),
        (i._kill = function (t) {
          var e,
            i = this._overwriteProps,
            s = this._firstPT;
          if (null != t[this._propName]) this._overwriteProps = [];
          else for (e = i.length; -1 < --e; ) null != t[i[e]] && i.splice(e, 1);
          for (; s; )
            null != t[s.n] &&
              (s._next && (s._next._prev = s._prev),
              s._prev
                ? ((s._prev._next = s._next), (s._prev = null))
                : this._firstPT === s && (this._firstPT = s._next)),
              (s = s._next);
          return !1;
        }),
        (i._mod = i._roundProps =
          function (t) {
            for (var e, i = this._firstPT; i; )
              (e =
                t[this._propName] ||
                (null != i.n && t[i.n.split(this._propName + "_").join("")])) &&
                "function" == typeof e &&
                (2 === i.f ? (i.t._applyPT.m = e) : (i.m = e)),
                (i = i._next);
          }),
        (O._onPluginEvent = function (t, e) {
          var i,
            s,
            n,
            r,
            a,
            h = e._firstPT;
          if ("_onInitAllProps" === t) {
            for (; h; ) {
              for (a = h._next, s = n; s && s.pr > h.pr; ) s = s._next;
              (h._prev = s ? s._prev : r) ? (h._prev._next = h) : (n = h),
                (h._next = s) ? (s._prev = h) : (r = h),
                (h = a);
            }
            h = e._firstPT = n;
          }
          for (; h; )
            h.pg && "function" == typeof h.t[t] && h.t[t]() && (i = !0),
              (h = h._next);
          return i;
        }),
        (st.activate = function (t) {
          for (var e = t.length; -1 < --e; )
            t[e].API === st.API && (G[new t[e]()._propName] = t[e]);
          return !0;
        }),
        (a.plugin = function (t) {
          if (!(t && t.propName && t.init && t.API))
            throw "illegal plugin definition.";
          var e,
            i = t.propName,
            s = t.priority || 0,
            n = t.overwriteProps,
            r = {
              init: "_onInitsgpmTween",
              set: "setRatio",
              kill: "_kill",
              round: "_mod",
              mod: "_mod",
              initAll: "_onInitAllProps",
            },
            a = A(
              "plugins." + i.charAt(0).toUpperCase() + i.substr(1) + "Plugin",
              function () {
                st.call(this, i, s), (this._overwriteProps = n || []);
              },
              !0 === t.global
            ),
            h = (a.prototype = new st(i));
          for (e in (((h.constructor = a).API = t.API), r))
            "function" == typeof t[e] && (h[r[e]] = t[e]);
          return (a.version = t.version), st.activate([a]), a;
        }),
        (t = _._gsQueue))
      ) {
        for (e = 0; e < t.length; e++) t[e]();
        for (i in w)
          w[i].func ||
            _.console.log("GSAP encountered missing dependency: " + i);
      }
      f = !1;
    }
  })(
    "undefined" != typeof module &&
      module.exports &&
      "undefined" != typeof global
      ? global
      : this || window,
    "sgpHelper"
  );

SGPMSpinnerObjects = [];
SGPMSpinner.eventNameBefore = "sgpm-before-spin-";
SGPMSpinner.eventNameAfter = "sgpm-after-spin-";

SGPMSpinner.init = function (popupId, hashId, reInit) {
  if (reInit && window.innerWidth > 768 && SGPMSpinner.reinitForDesktop) return;

  var popupMainWrapper = "";
  if (!popupId) {
    popupMainWrapper = "";
  }

  var popupHiddenElement = document.querySelector(
    '[data-sgpm-popup-id="' + popupId + '"]'
  );

  if (popupHiddenElement) {
    while (popupHiddenElement.parentNode) {
      if (popupHiddenElement.parentNode == document) {
        break;
      }
      if (
        popupHiddenElement.parentNode.classList.contains(
          "sgpm-popup-maker-wrapper"
        )
      ) {
        popupMainWrapper = popupHiddenElement.parentNode;
        break;
      }

      popupHiddenElement = popupHiddenElement.parentNode;
    }
  }

  if (!popupMainWrapper) return;

  /* collect pids of html elements with countdown popup type */
  var spinnerElements = popupMainWrapper.querySelectorAll(
    '[data-sgpopuptype = "FESpinnerElement"]'
  );

  if (spinnerElements.length) {
    var pid = [];
    for (var i = 0; i < spinnerElements.length; i++) {
      var currentPid = spinnerElements[i].getAttribute("data-pid");
      var spinnerElement = spinnerElements[i].querySelector(
        ".sgpm-spinner-container-main-container"
      );

      if (spinnerElement.querySelector("canvas")) {
        var canvas = spinnerElement.querySelector("canvas");
        canvas.parentNode.removeChild(canvas);
      }
      spinnerElement.setAttribute(
        "id",
        "sgpm-spinner-container-" + popupId + "-" + currentPid
      );
      pid.push(currentPid);
    }

    for (var i = 0; i < pid.length; i++) {
      var configAsJson = popupMainWrapper
        .querySelector(".sgpm-spinner-container-option-data-" + pid[i])
        .getAttribute("data-sgpm-spinner-options");
      var config = JSON.parse(configAsJson);
      var containerId = "sgpm-spinner-container-" + popupId + "-" + pid[i];
      var containerElement = popupMainWrapper.querySelector("#" + containerId);
      config.container.el = containerElement;
      config.container.hashId = hashId;
      config.spinnerConfig.id = "sgpm-spinner-canvas-" + popupId + "-" + pid[i];
      var gridStackItem = "";
      while (containerElement.parentNode) {
        if (containerElement.parentNode == document) {
          break;
        }
        if (containerElement.parentNode.classList.contains("grid-stack-item")) {
          gridStackItem = containerElement.parentNode;
          break;
        }

        containerElement = containerElement.parentNode;
      }

      if (window.innerWidth < 769) {
        SGPMSpinner.reinitForMobile = true;
        SGPMSpinner.reinitForDesktop = false;
        config.spinnerConfig.outerRadius = 140;
        config.spinnerConfig.textFontSize = 11;
        config.container.height = 340;

        gridStackItem.style.height = "340px";
      } else {
        SGPMSpinner.reinitForDesktop = true;
        SGPMSpinner.reinitForMobile = false;
      }

      var cookieAsJson = popupMainWrapper
        .querySelector(".sgpm-spinner-container-option-data-" + pid[i])
        .getAttribute("data-sgpm-spinner-cookie");
      var customEvents = popupMainWrapper
        .querySelector("[data-sgpm-popup-id]")
        .getAttribute("data-sgpm-spinner-custom-events");
      if (customEvents) {
        var customEventsObj = JSON.parse(customEvents);
        SGPMSpinner.eventNameBefore = customEventsObj.before;
        SGPMSpinner.eventNameAfter = customEventsObj.after;
      }

      var cookie = JSON.parse(cookieAsJson);

      config.spinnerConfig.onStop = function () {
        SGPMSpinner.onWin(arguments, popupId, cookie, hashId, popupMainWrapper);
      };

      config.spinnerConfig.saveWinningSliceText = function (spinnerSilceText) {
        if (typeof spinnerSilceText !== "undefined") {
          SGPMSpinner.saveWinningSliceText(spinnerSilceText, popupId);
        }
      };

      SGPMSpinnerObjects[popupId] = {};
      SGPMSpinnerObjects[popupId].obj = new SGPMSpinner(config);
    }
  }
};

SGPMSpinner.saveWinningSliceText = function (spinnerSilceText, popupId) {
  var subscriberId = SGPMSpinnerObjects[popupId]["subscriber_id"];

  if (typeof subscriberId !== "undefined") {
    var url = SGPM_APP_URL + "api/storeSpinnerSliceText";
    var params = "slice_text=" + spinnerSilceText;
    params += "&popup_id=" + popupId;
    params += "&subscriber_id=" + subscriberId;

    SGP.sendPostRequest(url, function () {}, params);
  }
};

SGPMSpinner.onWin = function (
  arguments,
  popupId,
  cookie,
  hashId,
  popupMainWrapper
) {
  if (cookie.showOnlyOnce) {
    var sameOriginCookie =
      typeof cookie.sameOriginCookie !== "undefined" &&
      cookie.sameOriginCookie == 1
        ? true
        : false;
    SGPMPopup.setCookie(
      "sgpm-spinner-" + hashId,
      "true",
      parseInt(cookie.cookieExpires),
      null,
      sameOriginCookie
    );
  }

  var localStorageVal = {
    spinnedOn: true,
  };
  SGPMPopup.setLocalStorage("sgpm-storage-" + hashId, localStorageVal);

  SGPM_MAIN_DIV = SGPM_MAIN_DIV_OBJ[popupId];

  var popupWrapperHeight = SGPM_MAIN_DIV.style.height;
  if (popupWrapperHeight == "") {
    popupWrapperHeight = SGPM_MAIN_DIV.clientHeight;
  }

  var winText = arguments[0].winText;

  setTimeout(function () {
    SGPM_MAIN_DIV.innerHTML =
      "<span id='sg-spinner-success-message'>" + winText + "</span>";
    var winTextContainer = SGPM_MAIN_DIV.querySelector(
      "#sg-spinner-success-message"
    );

    if (winTextContainer.clientHeight > popupWrapperHeight) {
      winTextContainer.style.overflowY = "scroll";
      winTextContainer.style.setProperty(
        "height",
        popupWrapperHeight + "px",
        "important"
      );
    }

    SGPM_MAIN_DIV.style.textAlign = "center";
    SGPM_MAIN_DIV.style.setProperty(
      "height",
      popupWrapperHeight + "px",
      "important"
    );

    /* fire an event after spinner has stoped spinning */
    SGP.createCustomEvent(
      SGPMSpinner.eventNameAfter + hashId,
      popupMainWrapper
    );
  }, 750);
};

function SGPMSpinner(config) {
  this.containerConfig = config.container;
  this.spinnerConfig = config.spinnerConfig;
  this.pointerConfig = config.pointerConfig;

  var parent = this.containerConfig.el;

  if (!parent) {
    return;
  }
  var self = this;

  var canvasEl = document.createElement("canvas");
  canvasEl.id = this.spinnerConfig.id;
  canvasEl.style.position = "relative";
  canvasEl.style.left = config.spinnerConfig.positionLeft + "px";
  canvasEl.style.top = config.spinnerConfig.positionTop + "px";

  parent.appendChild(canvasEl);
  if (this.containerConfig.width) {
    parent.style.width = this.containerConfig.width + "px";
  } else {
    this.containerConfig.width = parseInt(parent.offsetWidth);
  }
  canvasEl.setAttribute("width", this.containerConfig.width);
  if (this.containerConfig.height) {
    parent.style.height = this.containerConfig.height + "px";
  } else {
    this.containerConfig.height = parseInt(parent.offsetHeight);
  }
  canvasEl.setAttribute("height", this.containerConfig.height);

  if (typeof this.containerConfig.backgroundColor != "undefined") {
    parent.style.backgroundColor = this.containerConfig.backgroundColor;
  }

  this.spinnerConfig.segments = this.spinnerConfig.segments || [];

  var obj = {};
  obj.canvasId = this.spinnerConfig.id;
  obj.numSegments = this.spinnerConfig.segments.length;
  obj.segments = this.spinnerConfig.segments;
  obj.outerRadius = this.spinnerConfig.outerRadius;
  obj.textFontSize = this.spinnerConfig.textFontSize || 15;
  obj.pointerAngle = this.spinnerConfig.pointerAngle || 0;
  obj.innerRadius = this.spinnerConfig.innerRadius;
  obj.drawMode = this.spinnerConfig.image ? "image" : "code";
  obj.lineWidth = this.spinnerConfig.lineWidth || 0;
  obj.strokeStyle = this.spinnerConfig.lineStyle || null;
  obj.animation = {
    type: "spinToStop",
    duration: 5 /* Duration in seconds. */,
    spins: 8 /* Number of complete spins. */,
    callbackFinished: function () {
      self.callbackFinished();
    },
    callbackAfter: function () {
      self.drawTriangle();
    },
  };
  obj.drawWheel = true;
  obj.imageOverlay = true;

  this.spinner = new sgpSpinToWin(obj);

  this.wheelSpinning = false;
  if (this.spinnerConfig.image) {
    var loadedImg = new Image();

    /* Create callback to execute once the image has finished loading. */
    loadedImg.onload = function () {
      self.spinner.wheelImage =
        loadedImg; /* Make wheelImage equal the loaded image object. */
      self.spinner.draw(); /* Also call draw function to render the wheel. */
      self.drawTriangle();
    };

    /* Set the image source, once complete this will trigger the onLoad callback (above). */
    loadedImg.src = this.spinnerConfig.image;
  }

  this.callbackFinished = function () {
    self.wheelSpinning = false;
    var winningSegment = self.spinner.getIndicatedSegment();
    self.spinnerConfig.onStop(winningSegment);
  };

  this.resetWheel = function () {
    self.spinner.stopAnimation(
      false
    ); /* Stop the animation, false as param so does not call callback function. */
    self.spinner.rotationAngle = 0; /* Re-set the wheel angle to 0 degrees. */
    self.spinner.draw(); /* Call draw to render changes to the wheel. */
    self.wheelSpinning = false; /* Reset to false to power buttons and spin can be clicked again. */
  };

  this.spin = function (fromEditor) {
    if (self.wheelSpinning == false) {
      if (typeof fromEditor === "undefined") {
        /* fire an event before spinner started spinning */
        SGP.createCustomEvent(
          SGPMSpinner.eventNameBefore + self.containerConfig.hashId,
          self.containerConfig.el
        );
      }

      if (self.spinnerConfig.beforeSpin) {
        self.spinnerConfig.beforeSpin();
      }

      self.resetWheel();
      self.drawTriangle();

      var rand = SGPMSpinner.getRandomInt(1, 100);
      var winningSegment = 0;

      var segments = self.spinnerConfig.segments;
      var start = 0;
      for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (segment.winRatio) {
          if (rand >= start && rand <= start + segment.winRatio) {
            winningSegment = i + 1;
            break;
          } else {
            start += parseInt(segment.winRatio);
          }
        }
      }

      if (winningSegment && typeof fromEditor === "undefined") {
        var winningSliceObject = self.spinner.segments[winningSegment];
        var winningSliceText = winningSliceObject.text;

        self.spinnerConfig.saveWinningSliceText(winningSliceText);
        self.spinner.animation.stopAngle =
          self.spinner.getRandomForSegment(winningSegment);
      }

      /* Begin the spin animation by calling startAnimation on the wheel object. */
      self.spinner.startAnimation();

      /* Set to true so that power can't be changed and spin button re-enabled during */
      /* the current animation. The user will have to reset before spinning again. */
      self.wheelSpinning = true;
      if (self.spinnerConfig.afterSpin) {
        self.spinnerConfig.afterSpin();
      }
    }
  };

  this.drawTriangle = function () {
    /* Get the canvas context the wheel uses. */

    var lineWidth = self.pointerConfig.lineWidth;

    var arcOffsetX;
    var arcOffsetY;
    var pointerOffsetX = 15;
    var pointerOffsetY = 15;

    if (self.spinnerConfig.pointerAngle == 0) {
      arcOffsetX = 1;
      arcOffsetY = 1;
      pointerOffsetX = 0;
    } else if (self.spinnerConfig.pointerAngle == 45) {
      arcOffsetX = -1;
      arcOffsetY = 1;
      pointerOffsetX = -pointerOffsetX;
    } else if (self.spinnerConfig.pointerAngle == 90) {
      arcOffsetX = 0;
      arcOffsetY = -1;
      pointerOffsetY = 0;
      pointerOffsetX = -pointerOffsetX;
    } else if (self.spinnerConfig.pointerAngle == 135) {
      arcOffsetX = 0;
      arcOffsetY = -2;
      pointerOffsetX = -pointerOffsetX;
      pointerOffsetY = -pointerOffsetY;
    } else if (self.spinnerConfig.pointerAngle == 180) {
      arcOffsetX = 1;
      arcOffsetY = -2;
      pointerOffsetX = 0;
      pointerOffsetY = -pointerOffsetY;
    } else if (self.spinnerConfig.pointerAngle == 225) {
      arcOffsetX = 2;
      arcOffsetY = -2;
      pointerOffsetY = -pointerOffsetY;
    } else if (self.spinnerConfig.pointerAngle == 270) {
      arcOffsetX = 2;
      arcOffsetY = -1;
      pointerOffsetY = 0;
    } else if (self.spinnerConfig.pointerAngle == 315) {
      arcOffsetX = 2;
      arcOffsetY = 0;
    }

    var x = self.containerConfig.width / 2 + pointerOffsetX;
    var y = self.containerConfig.height / 2 + pointerOffsetY;
    var l = 1.3;
    var radius = l * self.spinnerConfig.outerRadius;
    var a = ((self.spinnerConfig.pointerAngle - 90) * Math.PI) / 180;

    var ctx = self.spinner.ctx;

    ctx.strokeStyle =
      self.pointerConfig.lineColor || "white"; /* Set line colour. */
    ctx.fillStyle =
      self.pointerConfig.pointerColor || "#333352"; /* Set fill colour. */
    ctx.lineWidth = lineWidth;
    ctx.beginPath(); /* Begin path. */

    var x1 = x + Math.cos(a + 0.1) * radius;
    var x2 = x + Math.cos(a - 0.1) * radius;
    var x3 = x + (Math.cos(a) * radius) / l;

    var y1 = y + Math.sin(a + 0.1) * radius;
    var y2 = y + Math.sin(a - 0.1) * radius;
    var y3 = y + (Math.sin(a) * radius) / l;

    var offset = Math.round(lineWidth / 4);
    var arcAngle = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
    var startAngle =
      ((self.spinnerConfig.pointerAngle - 90 - 90) * Math.PI) / 180;
    var endAngle =
      ((self.spinnerConfig.pointerAngle - 90 + 90) * Math.PI) / 180;

    var centerX = x + Math.cos(a) * radius + arcOffsetX;
    var centerY = y + Math.sin(a) * radius + arcOffsetY;

    ctx.arc(centerX, centerY, arcAngle, startAngle, endAngle);
    ctx.moveTo(x1 + offset, y1 - offset);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x2 + offset, y2 - offset);

    ctx.stroke(); /* Complete the path by stroking (draw lines). */
    ctx.fill(); /* Then fill. */
  };
}

SGPMSpinner.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
/* End spinner */

/* Start Facebook */
function SGPMFacebook() {}

SGPMFacebook.initFacebookPageElement = function (popupId, mainDiv) {
  if (!mainDiv.querySelector(".sgpm-facebook-page-content")) {
    return;
  }

  if (typeof FB === "object") {
    SGPMFacebook.parseFBElements();
  } else if (!document.getElementById("facebook-jssdk")) {
    SGPMFacebook.loadFBSDK();
  } else {
    SGPMFacebook.tryToParseFBElements();
  }

  SGPMFacebook.initFBEventListeners();
};

SGPMFacebook.parseFBElements = function () {
  document
    .querySelectorAll(".sgpm-facebook-page-content")
    .forEach(function (el) {
      FB.XFBML.parse(el);
    });
};

SGPMFacebook.tryToParseFBElements = function () {
  var s = setInterval(function () {
    if (typeof FB !== "undefined") {
      SGPMFacebook.parseFBElements();
      clearInterval(s);
    }
  }, 10);
};

SGPMFacebook.loadFBSDK = function () {
  if (!document.getElementById("fb-root")) {
    var root = document.createElement("div");
    root.id = "fb-root";
    document.body.prepend(root);
  }

  var js;
  var fjs = document.getElementsByTagName("script")[0];
  js = document.createElement("script");
  js.id = "facebook-jssdk";
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
};

SGPMFacebook.initFBEventListeners = function () {
  if (typeof FB === "object") {
    SGPMFacebook.setupFBEvents();
  } else {
    if (window.fbAsyncInit) var c = window.fbAsyncInit;
    window.fbAsyncInit = function () {
      SGPMFacebook.setupFBEvents();
      if (c) {
        c();
      }
      window.fbAsyncInit = function () {};
    };
  }
};

SGPMFacebook.setupFBEvents = function () {
  window.FB.init({
    appId: null,
    status: !0,
    cookie: !0,
    xfbml: !0,
    version: "v2.13",
  });
  window.FB.Event.subscribe("edge.create", SGP.afterFBPageLiked);
  window.addEventListener("message", SGPMFacebook.listenForFBLikes);
  window.FB.init = function () {};
};

SGPMFacebook.fbLikeData = [];
SGPMFacebook.fbFirstEventSkipped = false;
SGPMFacebook.fbe = false;
SGPMFacebook.fbc = 400;

SGPMFacebook.fbf = function (a) {
  SGPMFacebook.fbe = true;
  setTimeout(function () {
    SGPMFacebook.fbc -= 200;
    if (SGPMFacebook.fbc >= 0) {
      SGPMFacebook.fbf(a);
    } else {
      SGPMFacebook.fbe = false;
      a();
    }
  }, 200);
};

SGPMFacebook.listenForFBLikes = function (event) {
  if (event.origin.indexOf && event.origin.indexOf("facebook") != -1) {
    var data = SGPMFacebook.parseQuery(event.data);
    var iframes = document.querySelectorAll(
      ".sgpm-facebook-page-content iframe"
    );

    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      var c = iframes[i].getAttribute("src");
      var fbButtonName = SGPMFacebook.getFbButtonName(c);

      if (data.cb === fbButtonName) {
        var popupId = SGPM_POPUP_ID;
        var popupMainWrapper = "";
        if (iframe) {
          while (iframe.parentNode) {
            if (iframe.parentNode === document) {
              break;
            }

            if (
              iframe.parentNode.classList.contains("sgpm-popup-maker-wrapper")
            ) {
              popupMainWrapper = iframe.parentNode;
              popupId = popupMainWrapper
                .querySelector("[data-sgpm-popup-id]")
                .getAttribute("data-sgpm-popup-id");
              break;
            }
            iframe = iframe.parentNode;
          }
        }

        SGPMFacebook.handleFBLike(popupId);
        break;
      }
    }
  }
};

SGPMFacebook.handleFBLike = function (popupId) {
  if (SGPMFacebook.fbFirstEventSkipped || SGPMFacebook.isTouchScreen()) {
    SGPMFacebook.fbLikeData.push(event.data);
  } else {
    SGPMFacebook.fbFirstEventSkipped = true;
  }
  SGPMFacebook.fbc = 400;
  SGPMFacebook.fbe ||
    SGPMFacebook.fbf(function () {
      var e = 0;
      for (var f in SGPMFacebook.fbLikeData) {
        if (SGPMFacebook.fbLikeData[f].indexOf("resize&") >= 0 && e === 0) {
          e = 1;
        }
        if (
          1 === e &&
          SGPMFacebook.fbLikeData[f].indexOf("plugin_ready&") >= 0
        ) {
          e = 2;
        }
        if (2 === e && SGPMFacebook.fbLikeData[f].indexOf("resize&") >= 0) {
          e = 3;
        }
      }

      var g = e === 3 && SGPMFacebook.fbLikeData.length >= 3;
      if (g) {
        SGP.afterFBPageLiked(null, null, popupId);
      }
      SGPMFacebook.fbc = 400;
      SGPMFacebook.fbLikeData = [];
    });
};

SGPMFacebook.getFbButtonName = function (c) {
  var b = !1;

  if (c) {
    var fakeElement = document.createElement("a");
    fakeElement.href = c;

    var d = SGPMFacebook.parseQuery(fakeElement.search.replace("?", ""));
    e = !1;
    if (d)
      for (var f in d)
        if ("channel" === f) {
          e = decodeURIComponent(decodeURIComponent(d[f]));
          break;
        }
    if (e) {
      fakeElement.href = e;
      var g = SGPMFacebook.parseQuery(fakeElement.hash.replace("#", ""));
      g.cb && (b = g.cb);
    }
  }
  return b;
};

SGPMFacebook.parseQuery = function (a) {
  if ("string" != typeof a) return !1;
  var b = [];
  if (a) {
    var c = a.split("&");
    if (c)
      for (var d in c) {
        var e = c[d].split("=");
        b[e[0]] = e[1];
      }
  }
  return b;
};

SGPMFacebook.isTouchScreen = function () {
  return !!("ontouchstart" in window) || !!("onmsgesturechange" in window);
};

SGPMFacebook.removeEventListeners = function () {
  FB.Event.unsubscribe("edge.create", SGP.afterFBPageLiked);
  window.removeEventListener("message", SGPMFacebook.handleFBLikes);
};
/* End Facebook */

function SGPMFloatingButton() {}

SGPMFloatingButton.prototype.init = function (config, containerId) {
  var mainDiv = document.getElementById(
    "sgpm-popup-maker-floating-button-container-" + containerId
  );
  if (mainDiv) {
    mainDiv.parentNode.removeChild(mainDiv);
  }

  mainDiv = document.createElement("div");
  mainDiv.id = "sgpm-popup-maker-floating-button-container-" + containerId;
  mainDiv.style = "display: block !important;";

  var contentDiv = document.createElement("div");
  var style = config.params.style;
  var position = config.params.position;
  var backgroundColor = config.params.backgroundColor;
  var borderSize = config.params.borderSize;
  var borderStyles = "";
  var borderColor = config.params.borderColor;
  var textColor = config.params.textColor;
  var text = config.params.text;
  var textFontSize = config.params.textFontSize;
  var textFontWeight = config.params.textFontWeight;
  var fontSize = "font-size: 16px !important";
  var fontWeight = "font-weight: normal !important";

  var animation = "";
  if (config.params.animation != "none") {
    animation = "sgpm-animated " + config.params.animation;
  }

  if (typeof borderSize !== "undefined" && style === "basic") {
    borderStyles =
      "border-style: solid !important; " +
      "border-color: " +
      borderColor +
      "!important; " +
      "border-top: " +
      borderSize.top +
      "px; " +
      "border-right: " +
      borderSize.right +
      "px; " +
      "border-bottom: " +
      borderSize.bottom +
      "px; " +
      "border-left: " +
      borderSize.left +
      "px";
  }

  if (typeof textFontSize !== "undefined") {
    fontSize = "font-size: " + textFontSize + "px !important";
  }

  if (typeof textFontWeight !== "undefined") {
    fontWeight = "font-weight: " + textFontWeight + " !important";
  }

  contentDiv.className +=
    "sgpm-floating-" +
    style +
    "-button-content sgpm-floating-" +
    style +
    "-button-content-" +
    position;
  contentDiv.innerHTML =
    '<div class="' +
    animation +
    " sgpm-floating-" +
    style +
    "-button sgpm-floating-" +
    style +
    "-button-" +
    position +
    '" style="background-color: ' +
    backgroundColor +
    "; color: " +
    textColor +
    "; " +
    borderStyles +
    "; " +
    fontSize +
    "; " +
    fontWeight +
    '"><div class="sgpm-floating-' +
    style +
    "-button-text-" +
    position +
    " sgpm-floating-" +
    style +
    '-button-text">' +
    text +
    "</div></div>";

  mainDiv.appendChild(contentDiv);

  document.body.appendChild(mainDiv);

  mainDiv.onclick = function () {
    var scope = config.actionScope || window;
    config.action.call(
      scope,
      config.actionParams.forced,
      config.actionParams.eventName
    );
  };
};

SGPMFloatingButton.prototype.calculateFloatingButtonPosition = function () {
  /** calc position */
  var floatingButtonStyles = "";
  var windowHeight = window.innerHeight;
  var floatingButtonsDefaultHeight = 40;
  var floatingButtonsDefaultPosition = 33;
  var floatingButtonsDefaultOnHoverPosition = 39;
  var floatingButtons = document.getElementsByClassName(
    "sgpm-floating-basic-button-content"
  );

  // position - [top and bottom]
  for (var i = 0; i < floatingButtons.length; i++) {
    var floatingButton = floatingButtons[i];
    if (
      floatingButton.classList.contains(
        "sgpm-floating-basic-button-content-verticalLeft"
      ) ||
      floatingButton.classList.contains(
        "sgpm-floating-basic-button-content-verticalRight"
      )
    ) {
      var buttonWidth = floatingButton.offsetWidth;
      var elementTopStyle =
        (parseInt(windowHeight) - parseInt(buttonWidth)) / 2;
      var elementTopStyleInPercents =
        (100 * parseInt(elementTopStyle)) / parseInt(windowHeight);
      floatingButtonStyles +=
        "top: " + elementTopStyleInPercents + "% !important;";
    }

    /** calculate button distortion from original sizes */
    var buttonHeight = parseInt(floatingButton.offsetHeight);
    var heightDistortion = buttonHeight - floatingButtonsDefaultHeight;

    if (
      floatingButton.classList.contains(
        "sgpm-floating-basic-button-content-verticalLeft"
      )
    ) {
      var left = heightDistortion + floatingButtonsDefaultPosition;
      var leftOnHover =
        heightDistortion + floatingButtonsDefaultOnHoverPosition;
      floatingButtonStyles += "left: " + left + "px !important;";
      /** set hovering */
      floatingButton.addEventListener("mouseover", function () {
        floatingButton.style.left = leftOnHover + "px";
      });
      floatingButton.addEventListener("mouseout", function () {
        floatingButton.style.left = left + "px";
      });
    }

    if (
      floatingButton.classList.contains(
        "sgpm-floating-basic-button-content-verticalRight"
      )
    ) {
      var right = heightDistortion + floatingButtonsDefaultPosition;
      var rightOnHover =
        heightDistortion + floatingButtonsDefaultOnHoverPosition;
      floatingButtonStyles += "right: " + right + "px !important;";
      /** set hovering */
      floatingButton.addEventListener("mouseover", function () {
        floatingButton.style.right = rightOnHover + "px";
      });
      floatingButton.addEventListener("mouseout", function () {
        floatingButton.style.right = right + "px";
      });
    }
    /** set possitions */
    floatingButton.setAttribute("style", floatingButtonStyles);
  }
};
