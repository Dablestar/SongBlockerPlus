var filePath = "./banList.txt";
var currentBackground;

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}
function isBackgroundInList(URL){
    var result = false;
    getBanList()
    .then(banList => {
        for(var i=0; i<banList.length; i++){
            if(banList[i] == URL){
                sendSkipMsg();
                result = true;
            }
        }
    });
    if(!result){
        console.log("No skip");
    }
}

function getBanList(){
    // var isInsideList = fetch(filePath)
    // .then(result => result.text())
    // .then(text => {
    //     var lines = text.split('\r\n'); 
    //     return lines
    // });
    // return isInsideList;
    return new Promise((resolve) => {
        chrome.storage.local.get('banList', function(data) {
            console.log("get data: " + data.banList);
            var banListText = data.banList.split("\r\n");
            console.log(banListText);
            resolve(banListText);
        });
    })
    // .then(result => result.text())
    // .then(text => {
    //     var lines = text.split('\r\n');
    //     return lines;
    // });
    // return banList;
}

function sendSkipMsg(){
    console.log("sendSkipMsg()");
    getCurrentTab().then(response => {
        chrome.tabs.sendMessage(response, {action : "skip"});
    });
}

window.navigation.addEventListener('navigate', function(event) {
    var URL = event.destination.url;
    console.log("Navigate to: " + URL);
    isBackgroundInList(URL);
});
