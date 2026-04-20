console.log("Content Script Online");

  
  
  function getCurrentBackgroundURL(){
    console.log("getCurrentBackgroundURL()");
  }
  
  function getSkipButton(){
    console.log("getSkipButton()");
  }

  window.navigation.addEventListener("navigate", function(event) {
    console.log("navigate event detected");
    getCurrentBackgroundURL();
    getSkipButton();
  });