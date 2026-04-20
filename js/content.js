console.log("Content Script Online");

var currentURL = '';
var lastURL = '';

var sourceURL;
  
  function getSkipButton(){
    console.log("getSkipButton()");
  }

  function getCurrentBackgroundURL(){
    console.log("getCurrentBackgroundURL()", window.location.href);
  }

  function injectSourceURLParser(){
    document.creaseElement("script")
  }

  window.navigation.addEventListener("navigate", function(event) {
    console.log("navigate event detected");
    lastURL = currentURL;
    currentURL = window.location.href;

    console.log("currentURL: " + currentURL);
    console.log("lastURL: " + lastURL);

    if(currentURL == lastURL){
      console.log("URL has not changed.");
    } else {
      console.log("URL has changed.");
      getCurrentBackgroundURL();
    }
  });